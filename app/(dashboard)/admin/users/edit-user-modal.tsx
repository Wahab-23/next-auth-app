"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export default function EditUserModal({ user, onClose, onUpdated }: any) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    role: user.role?.name,
    isActive: user.isActive,
  });

  const token = localStorage.getItem("token");

  async function updateUser() {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("User updated!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Could not update user");
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={form.name}
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            value={form.email}
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            type="password"
            placeholder="New password (optional)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Select
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v })}
          >
            <SelectTrigger>
              <span>{form.role}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Merchandiser">Merchandiser</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={updateUser} className="w-full">
            Update User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
