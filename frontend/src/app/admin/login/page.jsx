import { AuthPageShell } from "../_components/auth-page-shell";
import { LoginForm } from "../_components/login-form";

export default async function AdminLoginPage({
  searchParams,
}) {
  const params = (await searchParams) ?? {};
  const resetSuccess = params.reset === "success";

  return (
    <AuthPageShell 
      title="Acceso Administrativo" 
      subtitle="VainyBliss Admin"
      description="Ingresa tus credenciales para gestionar la tienda."
    >
      <LoginForm resetSuccess={resetSuccess} />
    </AuthPageShell>
  );
}
