"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminSession } from "../_lib/auth-service";
import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "../_lib/session";

export function DashboardGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function validateAdminSession() {
      setErrorMessage(null);

      try {
        const user = await getAdminSession();
        saveAdminSession(user);

        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (error) {
        const localSession = loadAdminSession();

        if (localSession?.user) {
          if (isMounted) {
            setIsAuthorized(true);
            setIsChecking(false);
          }
          return;
        }

        clearAdminSession();

        if (isMounted) {
          setIsAuthorized(false);
          setIsChecking(false);

          const message =
            error instanceof Error
              ? error.message
              : "No fue posible validar la sesion.";
          setErrorMessage(message);

          setTimeout(() => {
            router.replace("/admin/login");
          }, 400);
        }
      }
    }

    validateAdminSession();

    function onStorageChange() {
      setIsChecking(true);
      validateAdminSession();
    }

    window.addEventListener("storage", onStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorageChange);
    };
  }, [pathname, router]);

  if (errorMessage && !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfaf7] px-4">
        <div className="max-w-md rounded-2xl border border-[#e9d9d2] bg-white/80 p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#8d5757]">
            No se pudo abrir el panel
          </p>
          <p className="mt-2 text-xs text-[#6f625c]">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isChecking || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfaf7]">
        <div className="text-sm font-medium text-[#8a7c74]">
          Cargando panel de administración...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
