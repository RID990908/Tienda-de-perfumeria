import { AuthCard } from "@/components/auth-card";
import { AuthLogo } from "@/components/auth-logo";

export function AuthPageShell({
  title,
  description,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-8">
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/fondo-vainybliss.jpg')" }} aria-hidden />
      <div className="fixed inset-0 -z-10 bg-[rgba(253,250,247,0.36)] backdrop-blur-[2px]" aria-hidden />
      <div className="w-full max-w-md space-y-6">
        <AuthLogo size={80} subtitle={subtitle} />
        <AuthCard title={title} description={description}>
          {children}
        </AuthCard>
      </div>
    </div>
  );
}
