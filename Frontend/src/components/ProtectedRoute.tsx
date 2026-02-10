import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const { isAuthenticated, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-blue-400 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Issue Tracker</h2>
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
