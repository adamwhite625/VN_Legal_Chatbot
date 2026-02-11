import { useEffect, useState } from "react";
import * as api from "@/services/chatApi";
import { Users, MessageSquare, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api
      .getAdminStats()
      .then(setStats)
      .catch((err) => console.error("Lỗi tải stats:", err));
  }, []);

  if (!stats) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h2>

      {/* Thẻ thống kê */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Tổng người dùng"
          value={stats.total_users}
          icon={<Users className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Phiên tư vấn"
          value={stats.total_sessions}
          icon={<MessageSquare className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Tin nhắn đã xử lý"
          value={stats.total_messages}
          icon={<Database className="h-4 w-4 text-orange-500" />}
        />
      </div>

      {/* Danh sách user mới */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Người dùng mới đăng ký</h3>
        <div className="space-y-4">
          {stats.recent_users.map((u: any) => (
            <div
              key={u.id}
              className="flex justify-between items-center border-b pb-2 last:border-0"
            >
              <div>
                <p className="font-medium">{u.full_name || "Chưa đặt tên"}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                ID: {u.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
