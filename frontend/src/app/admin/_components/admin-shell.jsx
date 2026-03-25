"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAdmin } from "../_lib/auth-service";
import { clearAdminSession, loadAdminSession } from "../_lib/session";

const navigation = [
  { href: "/admin/products", label: "Productos" },
];

export function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(loadAdminSession()?.user ?? null);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      clearAdminSession();
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full text-[#3c312d]">
      <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/fondo-vainybliss.jpg')" }} aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[rgba(253,250,247,0.36)] backdrop-blur-[1px]" aria-hidden />
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-[rgba(177,146,113,0.42)] bg-white/65 backdrop-blur-xl shadow-lg">
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full font-bold text-white">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold">VainyBliss</h1>
              <p className="text-[10px] text-[#8a7c74]">Panel de control</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-white text-[#174830] shadow-sm" : "text-[#8a7c74] hover:bg-white/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-[rgba(177,146,113,0.2)]">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-[#8a7c74]">{user?.email ?? "Administrador"}</p>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-[#8d5757] hover:bg-white"
            >
              {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 w-full p-8">
        {children}
      </main>
    </div>
  );
}
