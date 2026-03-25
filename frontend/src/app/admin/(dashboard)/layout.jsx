import { AdminShell } from "../_components/admin-shell";
import { DashboardGuard } from "../_components/dashboard-guard";

export default function AdminDashboardLayout({ children }) {
  return (
    <DashboardGuard>
      <AdminShell>
        {children}
      </AdminShell>
    </DashboardGuard>
  );
}
