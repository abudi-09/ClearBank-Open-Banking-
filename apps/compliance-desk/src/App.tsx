import { UserRole } from "@clearbank/types";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ComplianceLayout } from "@/layouts/ComplianceLayout";
import { AUTH_TOKEN_KEY, getRoleFromToken } from "@/lib/auth";
import AuditLogPage from "@/pages/AuditLogPage";
import AMLPage from "@/pages/AML";
import KYCPage from "@/pages/KYC";
import LoginPage from "@/pages/Login";
import ReportsPage from "@/pages/Reports";
import TransactionsPage from "@/pages/Transactions";

function requireComplianceToken(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;
  const role = getRoleFromToken(token);
  const parsed = UserRole.safeParse(role);
  return parsed.success && parsed.data === "COMPLIANCE";
}

function ComplianceGate() {
  if (!requireComplianceToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ComplianceGate />}>
        <Route element={<ComplianceLayout companyName="ClearBank Compliance" />}>
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/aml" element={<AMLPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/kyc" replace />} />
    </Routes>
  );
}
