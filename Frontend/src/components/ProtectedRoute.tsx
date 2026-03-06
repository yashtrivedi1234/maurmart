import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    
    // Check if the user is an admin
    if (decoded.role !== "admin") {
      // Not an admin, redirect to homepage or show unauthorized
      return <Navigate to="/" replace />;
    }
    
    return children;
  } catch (error) {
    // Invalid token
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
