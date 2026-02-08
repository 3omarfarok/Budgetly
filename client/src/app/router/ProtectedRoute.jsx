import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { AIButton } from "../../modules/ai/components";

export default function ProtectedRoute({ children, requireHouse = true }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireHouse && !user.house) {
    return <Navigate to="/house-selection" />;
  }

  return (
    <>
      {children}
      {requireHouse && location.pathname !== "/ai" ? <AIButton /> : null}
    </>
  );
}
