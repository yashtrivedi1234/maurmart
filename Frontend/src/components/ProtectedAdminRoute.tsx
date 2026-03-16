import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const isAdmin = localStorage.getItem("isAdmin");
  const adminToken = localStorage.getItem("adminToken");

  // Check if user has admin credentials
  if (!isAdmin || !adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedAdminRoute;
