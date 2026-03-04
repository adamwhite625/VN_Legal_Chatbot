import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/shared/layout/MainLayout";
import { useAuthStore } from "@/features/auth/model/authStore";
import { adminApi, type AdminStats, type User } from "@/services/adminApi";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await adminApi.getStats();
        const usersData = await adminApi.getAllUsers(0, 10);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-xl">Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">Lỗi: {error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            📊 Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Xem thống kê và quản lý hệ thống</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  👥 Tổng User
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.total_users || 0}
                </p>
              </div>
              <div className="text-5xl text-blue-200">👥</div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  💬 Chat Sessions
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.total_sessions || 0}
                </p>
              </div>
              <div className="text-5xl text-green-200">💬</div>
            </div>
          </div>

          {/* Total Messages */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">📝 Tin Nhắn</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.total_messages || 0}
                </p>
              </div>
              <div className="text-5xl text-purple-200">📝</div>
            </div>
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            👥 User Gần Đây
          </h2>

          {stats?.recent_users && stats.recent_users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ngày Tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {user.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "admin" ? "🔴 Admin" : "👤 User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Không có user nào</p>
          )}
        </div>

        {/* All Users Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📋 Danh Sách User
          </h2>

          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {user.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "admin" ? "🔴 Admin" : "👤 User"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Không có user nào</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
