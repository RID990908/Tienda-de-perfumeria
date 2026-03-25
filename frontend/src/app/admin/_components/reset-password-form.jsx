"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetAdminPassword } from "../_lib/auth-service";

export function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace no contiene un token válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetAdminPassword(email.trim(), token, password);
      router.replace("/admin/login?reset=success");
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : "No se pudo actualizar la contraseña.";
      setError(
        /c[oó]digo.*inv[aá]lido|expirado/i.test(message)
          ? "El código no es válido o ya expiró. Solicita uno nuevo desde 'Recuperar acceso'."
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="p-3 rounded-xl bg-white/60 border border-[rgba(177,146,113,0.2)] text-xs text-[#8a7c74] font-semibold text-center">
        El código de recuperación es válido por 30 minutos desde su emisión.
      </p>
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
            className="w-full bg-white border border-[rgba(177,146,113,0.2)] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#174830]/10 transition-all font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#8a7c74] uppercase tracking-wider">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Crea una contraseña segura"
            autoComplete="new-password"
            required
            className="w-full bg-white border border-[rgba(177,146,113,0.2)] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#174830]/10 transition-all font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#8a7c74] uppercase tracking-wider">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite la nueva contraseña"
            autoComplete="new-password"
            required
            className="w-full bg-white border border-[rgba(177,146,113,0.2)] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#174830]/10 transition-all font-medium"
          />
        </div>

        {error && <p className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-100 italic text-center text-balance">{error}</p>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#174830] text-white py-4 rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#174830]/10"
        >
          {isSubmitting ? "Guardando..." : "Guardar contraseña"}
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
