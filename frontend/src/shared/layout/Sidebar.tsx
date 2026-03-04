import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/authStore";

export default function Sidebar() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className="w-64 bg-white shadow min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-3">
        <Link to="/" className="block p-2 rounded hover:bg-blue-100">
          🔎 Legal Search
        </Link>

        <Link to="/consultant" className="block p-2 rounded hover:bg-blue-100">
          🤖 AI Consultant
        </Link>

        <Link to="/tracking" className="block p-2 rounded hover:bg-blue-100">
          📚 Theo Dõi Pháp Lý
        </Link>

        {/* Admin Dashboard - Only show for admins */}
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="block p-2 rounded hover:bg-red-100 border-l-4 border-red-500"
          >
            📊 Admin Dashboard
          </Link>
        )}
      </nav>
    </div>
  );
}
