"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp } from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading overview...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <TrendingUp className="h-7 w-7 text-blue-600" />
        Merchandiser Performance Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.merchandisers?.map((m: any) => (
          <Card key={m.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sky-600" />
                {m.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                Monthly Uploads: <span className="font-semibold">{m.monthlyUploads}</span>
              </p>

              <p className="text-sm text-gray-600">
                Monthly Target: <span className="font-semibold">{m.monthlyTarget}</span>
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold">
                  Achieved: {m.achievedPercentage}%
                </p>
                <Progress value={m.achievedPercentage} className="mt-1 h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
