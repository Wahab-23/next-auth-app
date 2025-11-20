"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  UserCircle,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import EditUserModal from "./edit-user-modal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);

  // Fetch all users
  async function loadUsers() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function deleteUser(id: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("User deleted");
      loadUsers();
    } catch {
      toast.error("Could not delete user");
    }
  }

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );

  return (
    <div className="p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">All Users</h1>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-gray-500" />
                      {u.name}
                    </td>

                    <td className="p-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {u.email}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={u.role?.name === "Admin" ? "default" : "secondary"}
                      >
                        {u.role?.name}
                      </Badge>
                    </td>

                    <td className="p-3">
                      {u.isActive ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-red-600 hover:bg-red-700">Inactive</Badge>
                      )}
                    </td>

                    <td className="p-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowEdit(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="text-center py-6 text-gray-500">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showEdit && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEdit(false)}
          onUpdated={loadUsers}
        />
      )}
    </div>
  );
}
