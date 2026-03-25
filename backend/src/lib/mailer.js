import nodemailer from "nodemailer";

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isPlaceholder = !user || !pass || user.includes("tu_correo") || pass.includes("tu_password");

  if (isPlaceholder) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Mailer] Configurando Ethereal (Test SMTP) automáticamente...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        console.log("[Mailer] Ethereal configurado listo para pruebas.");
        return cachedTransporter;
      } catch (err) {
        console.error("Error creando cuenta Ethereal:", err);
        return null;
      }
    }
    return null;
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  } catch (error) {
    console.error("[Mailer] Error al crear el transporte SMTP:", error.message);
    return null;
  }
};

export const sendOTPEmail = async (email, otp, type = "REGISTRATION") => {
  const transporter = await getTransporter();
  
  const typeLabel = type === "REGISTRATION" ? "Verificación" : "Recuperación";
  
  if (!transporter) {
    console.log(`\x1b[33m%s\x1b[0m`, `[SIMULACIÓN MAIL] Destinatario: ${email} | Código (${typeLabel}): ${otp}`);
    return { delivered: false, simulated: true };
  }

  const from = process.env.EMAIL_FROM || "VainyBliss Support <support@vainybliss.com>";
  
  const subject = type === "REGISTRATION" 
    ? "Verifica tu cuenta en VainyBliss" 
    : "Recupera tu contraseña en VainyBliss";

  const message = type === "REGISTRATION"
    ? "Gracias por unirte a VainyBliss. Tu código de verificación es:"
    : "Has solicitado recuperar tu contraseña. Tu código de verificación es:";

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #174830;">${subject}</h2>
          <p style="color: #666;">${message}</p>
          <div style="background: #fdfaf7; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #174830; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #888;">Este código expira en 30 minutos. No lo compartas con nadie.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa;">Si no has solicitado este correo, puedes ignorarlo con seguridad.</p>
        </div>
      `,
    });
    
    console.log(`[Mailer] Correo de ${typeLabel} enviado a ${email}`);
    
    // Check if it's ethereal mail
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\x1b[36m%s\x1b[0m`, `[PREVIEW URL] Visualiza el correo aquí: ${previewUrl}`);
    }

    return { delivered: true, simulated: false };
  } catch (error) {
    console.error(`[Mailer] Error crítico al enviar correo a ${email}:`, error.message);
    if (process.env.NODE_ENV !== "production") {
      console.log(`\x1b[33m%s\x1b[0m`, `[SIMULACIÓN POR FALLO] Destinatario: ${email} | Código (${typeLabel}): ${otp}`);
      return { delivered: false, simulated: true };
    } else {
      throw error;
    }
  }
};
