// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    // Login ke baad user isi page par wapas aayega
    try {
      sessionStorage.setItem("redirect_after_login", location.pathname);
    } catch {
      /* ignore */
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
