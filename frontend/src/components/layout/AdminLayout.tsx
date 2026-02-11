import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Users, LogOut, Home } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Bảo vệ: Nếu không phải admin -> Về trang chủ
  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
            🛡️ Admin Panel
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem
            to="/admin"
            icon={<LayoutDashboard />}
            label="Tổng quan"
            active={location.pathname === "/admin"}
          />
          <NavItem
            to="/admin/users"
            icon={<Users />}
            label="Quản lý User"
            active={location.pathname === "/admin/users"}
          />
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
          >
            <Home className="h-4 w-4" /> Về trang Chat
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

// Component link nhỏ
function NavItem({ to, icon, label, active }: any) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        active
          ? "bg-red-50 text-red-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
