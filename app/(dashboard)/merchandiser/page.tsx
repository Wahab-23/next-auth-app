"use client";

import * as React from "react";
import { Target, TrendingUp, CalendarDays, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const [name, setName] = React.useState<string>("Guest");
  const [stats, setStats] = React.useState({
    weeklyUploads: 0,
    weeklyTarget: 250, // 50/day * 5 days
    monthlyUploads: 0,
    monthlyTarget: 1000, // example monthly goal
    equivalentUploads: 0,
  });

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setName(parsed.name || "Guest");
      } catch {
        setName("Guest");
      }
    }

    // 🔹 Fetch recent record stats from API
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/records", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          const weekly = data.filter(
            (r) => new Date(r.date) >= startOfWeek
          );
          const monthly = data.filter(
            (r) => new Date(r.date) >= startOfMonth
          );

          const sumWeekly = weekly.reduce((sum, r) => sum + r.equivalentUploads, 0);
          const sumMonthly = monthly.reduce((sum, r) => sum + r.equivalentUploads, 0);

          setStats({
            weeklyUploads: sumWeekly,
            weeklyTarget: 250,
            monthlyUploads: sumMonthly,
            monthlyTarget: 1000,
            equivalentUploads: sumMonthly + sumWeekly,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchStats();
  }, []);

  const weeklyProgress = Math.min(
    (stats.weeklyUploads / stats.weeklyTarget) * 100,
    100
  );
  const monthlyProgress = Math.min(
    (stats.monthlyUploads / stats.monthlyTarget) * 100,
    100
  );

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Hello, {name} 👋
        </h1>
        <p className="text-gray-600">
          Here’s your performance summary for this week and month.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Uploads</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyUploads}</div>
            <Progress value={weeklyProgress} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              Target: {stats.weeklyTarget} ({weeklyProgress.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Uploads</CardTitle>
            <CalendarDays className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyUploads}</div>
            <Progress value={monthlyProgress} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              Target: {stats.monthlyTarget} ({monthlyProgress.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Equivalent</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.equivalentUploads)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Combined performance this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Goal Status</CardTitle>
            <Target className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyProgress >= 100 ? "✅ Achieved" : "In Progress"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep it up to meet your monthly goals!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
