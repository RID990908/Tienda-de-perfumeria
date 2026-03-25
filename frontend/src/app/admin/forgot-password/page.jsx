import { AuthPageShell } from "../_components/auth-page-shell";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

export default function AdminForgotPasswordPage() {
  return (
    <AuthPageShell 
      title="Recuperar Acceso" 
      subtitle="Admin"
      description="Ingresa tu correo para recibir un enlace de recuperación."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
