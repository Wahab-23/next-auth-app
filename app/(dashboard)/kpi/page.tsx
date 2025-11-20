"use client";

import * as React from "react";
import { CalendarIcon, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ReportsPage() {
  const [records, setRecords] = React.useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = React.useState<any[]>([]);
  const [selectedDate, setSelectedDate] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecords() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch("/api/records", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setRecords(data);
          setFilteredRecords(data);
        }
      } catch (err) {
        console.error("Error fetching records:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

  // 🔍 Filter records by selected date
  React.useEffect(() => {
    if (!selectedDate) setFilteredRecords(records);
    else {
      const filtered = records.filter(
        (r) => format(new Date(r.date), "yyyy-MM-dd") === selectedDate
      );
      setFilteredRecords(filtered);
    }
  }, [selectedDate, records]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading records...
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText className="text-blue-500" /> My Daily Reports
      </h1>

      {/* Date filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 w-48"
          />
        </div>
        {selectedDate && (
          <Button variant="outline" onClick={() => setSelectedDate("")}>
            Clear
          </Button>
        )}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-sm">No records found for this date.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{format(new Date(record.date), "dd MMM yyyy")}</span>
                  {record.attachmentUrl && (
                    <a
                      href={record.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline"
                    >
                      View File
                    </a>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-1">
                <p><strong>Product Uploads:</strong> {record.productUploads}</p>
                <p><strong>Re-Optimizations:</strong> {record.reOptimizations}</p>
                <p><strong>Price Updates:</strong> {record.priceUpdates}</p>
                <p><strong>Stock Updates:</strong> {record.stockUpdates}</p>
                {record.comments && (
                  <p className="text-gray-500 italic">“{record.comments}”</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
