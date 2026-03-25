"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { loginAdmin } from "../_lib/auth-service";
import { saveAdminSession } from "../_lib/session";

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#8a7c74] uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        suppressHydrationWarning
        className="w-full bg-[rgba(255,255,255,0.7)] border border-white/80 rounded-full px-5 py-3 shadow-inner text-sm text-[#3c312d] focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 transition-all font-medium"
      />
    </div>
  );
}

export function LoginForm({ resetSuccess = false }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isDisabled = useMemo(() => {
    return isSubmitting || email.trim().length === 0 || password.length === 0;
  }, [email, isSubmitting, password]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await loginAdmin(email.trim(), password);
      if (!user) {
        throw new Error("No se recibio informacion de usuario en el login.");
      }

      saveAdminSession(user);
      router.replace("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold border border-green-100 italic">
          La contraseña se actualizó correctamente. Ya puedes iniciar sesión.
        </div>
      )}

      <div className="space-y-4">
        <Field 
          label="Email" 
          type="email" 
          value={email} 
          onChange={setEmail} 
          placeholder="admin@vainybliss.com" 
          autoComplete="email"
        />
        <Field 
          label="Password" 
          type="password" 
          value={password} 
          onChange={setPassword} 
          placeholder="••••••••" 
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-4 text-center">
        <p className="text-xs text-[#8a7c74] font-medium italic">Acceso exclusivo para administración.</p>
        <Link href="/admin/forgot-password" title="Recuperar contraseña" className="text-xs font-semibold text-[#1a4731] hover:underline underline-offset-4 decoration-[#1a4731]/30 transition-all">
          Olvidé mi contraseña
        </Link>
      </div>

      {error && <p className="p-4 rounded-[1.5rem] bg-red-50 text-red-700 text-xs font-semibold border border-red-100 italic text-center">{error}</p>}

      <button 
        type="submit" 
        disabled={isDisabled}
        className="w-full bg-[#1a4731] text-white py-3.5 rounded-full font-medium hover:bg-[#123624] shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
