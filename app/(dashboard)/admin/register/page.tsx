"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const form = useForm({
    defaultValues: { name: "", email: "", password: "", roleId: "" },
  });

  const router = useRouter();

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  // fetch roles
  useEffect(() => {
    async function loadRoles() {
      try {
        const token = localStorage.getItem("token");
      const res = await fetch("/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
        const data = await res.json();
        if (Array.isArray(data)) setRoles(data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    }
    loadRoles();
  }, []);

  async function onSubmit(values: any) {
    // simple validation
    if (!values.name || !values.email || !values.password || !values.roleId) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            ...values,
            roleId: Number(values.roleId),
        }),
      }
      
    );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success("User created successfully!");
      form.reset();
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user");
    }
  }

  return (
    <div className="flex justify-center p-10">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle>Create New User 👤</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Create User
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-sm text-gray-500">
          Only admins can create new users
        </CardFooter>
      </Card>
    </div>
  );
}
