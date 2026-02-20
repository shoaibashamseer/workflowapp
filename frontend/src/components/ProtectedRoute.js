import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, allow, children }) {
  // not logged in
  if (!role) {
    return <Navigate to="/" replace />;
  }

  // role not allowed
  if (!allow.includes(role)) {
    // redirect based on role
    if (role === "manager") return <Navigate to="/manager" replace />;
    if (role === "bosss") return <Navigate to="/boss" replace />;
    return <Navigate to="/worker" replace />;
  }

  return children;
}
