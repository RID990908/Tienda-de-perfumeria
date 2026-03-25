import { AuthPageShell } from "../_components/auth-page-shell";
import { ResetPasswordForm } from "../_components/reset-password-form";

export default async function AdminResetPasswordPage({
  searchParams,
}) {
  const params = (await searchParams) ?? {};
  const token = params.token ?? "";

  return (
    <AuthPageShell 
      title="Restablecer Contraseña" 
      subtitle="Admin"
      description="Ingresa tu nueva contraseña para recuperar el acceso."
    >
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
