import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Import các trang Public & User
import ChatPage from "@/pages/ChatPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Import các trang Admin (MỚI)
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import UsersManager from "@/pages/admin/UsersManager";

// --- COMPONENT BẢO VỆ (Gatekeeper) ---
// Nhiệm vụ: Kiểm tra user có đăng nhập chưa.
// (Lưu ý: Việc check quyền Admin cụ thể đã được AdminLayout lo, nên ở đây chỉ cần check login)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // 1. Đang tải -> Hiện loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // 2. Chưa đăng nhập -> Đá về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Đã đăng nhập -> Cho vào
  return <>{children}</>;
}

// --- APP CHÍNH ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ============================== */}
          {/* 1. ROUTE CÔNG KHAI (Public)    */}
          {/* ============================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ============================== */}
          {/* 2. ROUTE USER (Chat App)       */}
          {/* ============================== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* ============================== */}
          {/* 3. ROUTE ADMIN (MỚI THÊM)      */}
          {/* ============================== */}
          {/* Logic:
             1. ProtectedRoute: Đảm bảo đã login.
             2. AdminLayout: Bên trong nó sẽ check tiếp user.role === 'admin'.
             3. Nested Routes: Dashboard & UsersManager sẽ render vào chỗ <Outlet /> của Layout.
          */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Mặc định vào /admin sẽ hiện Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Đường dẫn /admin/users */}
            <Route path="users" element={<UsersManager />} />
          </Route>

          {/* ============================== */}
          {/* 4. CATCH-ALL (404)             */}
          {/* ============================== */}
          {/* Gõ linh tinh -> Về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
