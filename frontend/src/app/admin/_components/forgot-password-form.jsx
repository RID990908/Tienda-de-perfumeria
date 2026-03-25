"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotAdminPassword } from "../_lib/auth-service";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotAdminPassword(email.trim());
      const delivery = response?.data?.delivery;
      if (delivery?.delivered) {
        setMessage("Correo enviado correctamente. Revisa tu bandeja de entrada y spam.");
      } else if (delivery?.simulated) {
        setMessage("Solicitud recibida. SMTP no está configurado; en desarrollo, el código se muestra en la terminal del backend.");
      } else {
        setMessage(response?.message || "Si el correo existe, recibirás un enlace para restablecer la contraseña.");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar el enlace.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#8a7c74] uppercase tracking-wider">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@vainybliss.com"
            autoComplete="email"
            required
            className="w-full bg-white border border-[rgba(177,146,113,0.3)] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#174830]/10 transition-all font-medium"
          />
        </div>

        {error && <p className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-100 italic text-center text-balance">{error}</p>}
        {message && <p className="p-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold border border-green-100 italic text-center text-balance">{message}</p>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#174830] text-white py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#174830]/10"
        >
          {isSubmitting ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link href="/admin/login" className="text-xs font-bold text-[#8a7c74] hover:text-[#174830] transition-all underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
