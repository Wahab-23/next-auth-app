"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Upload } from "lucide-react";

export default function MerchandisingKPIPage() {
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    productUploads: 0,
    reOptimizations: 0,
    priceUpdates: 0,
    priceComparisons: 0,
    stockUpdates: 0,
    csvUpdates: 0,
    date: new Date().toISOString().split("T")[0],
    comments: "",
    attachmentUrl: "",
  })

  const todayStr = new Date().toISOString().split("T")[0]
  const isTodayRecord = todayStr === formData.date

  const [records, setRecords] = useState([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const uploadFile = async () => {
    if (!file) return null
    const fd = new FormData()
    fd.append("file", file)
    fd.append("userId", localStorage.getItem("userId") || "")
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const attachmentUrl = await uploadFile()
    formData.attachmentUrl = attachmentUrl

    const token = localStorage.getItem("token")
    if (!token) return toast.error("Not authenticated!")

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          productUploads: Number(formData.productUploads),
          reOptimizations: Number(formData.reOptimizations),
          priceUpdates: Number(formData.priceUpdates),
          priceComparisons: Number(formData.priceComparisons),
          stockUpdates: Number(formData.stockUpdates),
          csvUpdates: Number(formData.csvUpdates),
          comments: formData.comments || null,
          attachmentUrl: formData.attachmentUrl || null,
        }),
      })

      if (!res.ok) throw new Error()

      toast.success("Record Saved ✅")

      setFormData({
        productUploads: 0,
        reOptimizations: 0,
        priceUpdates: 0,
        priceComparisons: 0,
        stockUpdates: 0,
        csvUpdates: 0,
        date: new Date().toISOString().split("T")[0],
        comments: "",
        attachmentUrl: "",
      })

      fetchRecords()
    } catch (error) {
      toast.error("Failed to save record")
      console.error(error)
    }
  }

  const fetchRecords = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("/api/records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setRecords(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* ✅ KPI Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Record Daily Merchandising Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1  gap-4">
            {[
              ["Product Uploads", "productUploads"],
              ["Re-Optimizations", "reOptimizations"],
              ["Price Updates", "priceUpdates"],
              ["Price Comparisons", "priceComparisons"],
              ["Stock Updates", "stockUpdates"],
              ["CSV Updates (per 100 products)", "csvUpdates"],
            ].map(([label, name]) => (
              <div key={name} className="flex flex-col items-start gap-2">
                <Label>{label}</Label>
                <Input
                  type="number"
                  min="0"
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="col-span-full flex flex-col items-start gap-2">
              <Label>Comments / Issues (optional)</Label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                rows={3}
                className="w-full border rounded-md p-2"
                placeholder="Write if you faced any issues today..."
              />
            </div>

            {/* ✅ Date Selector */}
            <div className="flex flex-col items-start gap-2">
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <label className="text-sm font-medium text-gray-700">Upload File</label>
              <label
                className={`flex items-center justify-center w-full sm:w-64 px-4 py-2 border border-dashed rounded-xl cursor-pointer transition
                    ${!isTodayRecord
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
              >
                <span className="text-sm font-medium flex  items-center gap-2">
                  <Upload size={18} className="w-8"/>
                  {file ? file.name : "Choose CSV or Excel file"}
                </span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={!isTodayRecord}
                  className="hidden"
                />
              </label>
              {!isTodayRecord && (
                <p className="text-xs text-red-500 mt-1">
                  You can only upload file for today’s record.
                </p>
              )}
            </div>


            <div className="col-span-full flex justify-end mt-4">
              <Button type="submit" disabled={!isTodayRecord && records.length > 0}>{isTodayRecord ? "Update Today Record" : "Submit"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ✅ KPI Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Equivalent Uploads Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No records yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={records}>
                <XAxis
                  dataKey={(r) => new Date(r.date).toLocaleDateString()}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(v) => Number(v).toFixed(2)} />
                <Bar dataKey="equivalentUploads" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
