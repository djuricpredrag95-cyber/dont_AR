import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Учитавање...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/izlaznost/login" replace />;
  }

  return <>{children}</>;
}
