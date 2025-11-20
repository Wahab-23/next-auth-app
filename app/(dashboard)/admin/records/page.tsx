"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarRange, User, Search, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [date, setDate] = useState("");

  async function fetchRecords() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/records", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setRecords(data);
      setFiltered(data);

      // Extract unique users (for admin)
      const uniqueUsers = [
        ...new Map(data.map((rec: any) => [rec.user.id, rec.user])).values(),
      ];
      setUsers(uniqueUsers);

    } catch (error) {
      console.error("Failed to load records", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtering system
  useEffect(() => {
    let temp = [...records];

    if (search.trim() !== "") {
      temp = temp.filter((rec) =>
        rec.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedUser !== "all") {
      temp = temp.filter((rec) => rec.user.id == selectedUser);
    }

    if (date !== "") {
      temp = temp.filter((rec) => rec.date.startsWith(date));
    }

    setFiltered(temp);
  }, [search, selectedUser, date, records]);

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">📊 Admin KPI Dashboard</h1>
      <p className="text-gray-600">Review all merchandising team performance records.</p>

      {/* FILTERS */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <select
              className="border rounded-lg p-2 w-full"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-gray-500" />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product Uploads</th>
                    <th className="p-3">Re-Optimizations</th>
                    <th className="p-3">Price Updates</th>
                    <th className="p-3">Equivalent Score</th>
                    <th className="p-3">Comments</th>
                    <th className="p-3">Attachment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => (
                    <tr key={rec.id} className="border-t">
                      <td className="p-3">{rec.user.name}</td>
                      <td className="p-3">{format(new Date(rec.date), "dd MMM yyyy")}</td>
                      <td className="p-3">{rec.productUploads}</td>
                      <td className="p-3">{rec.reOptimizations}</td>
                      <td className="p-3">{rec.priceUpdates}</td>
                      <td className="p-3 font-semibold text-blue-600">
                        {Math.round(rec.equivalentUploads)}
                      </td>
                      <td className="p-3 text-gray-600">{rec.comments || "-"}</td>
                      <td className="p-3">
                        {rec.attachmentUrl ? (
                          <a
                            href={rec.attachmentUrl}
                            target="_blank"
                            className="text-blue-600 flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" /> View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
