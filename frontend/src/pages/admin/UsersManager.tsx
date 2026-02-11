import { useEffect, useState } from "react";
import * as api from "@/services/chatApi";
import type { User } from "@/types";

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.getAllUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Danh sách người dùng</h2>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Họ tên</th>
              <th className="px-6 py-3">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4 font-medium">{user.email}</td>
                <td className="px-6 py-4">{user.full_name || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
