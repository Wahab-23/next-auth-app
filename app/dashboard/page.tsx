"use client";
import * as React from "react";

export default function DashboardPage() {
  const [name, setName] = React.useState<string>("");

  React.useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setName(parsed.name || "Guest");
      } catch (error) {
        console.error("Error parsing user:", error);
        setName("Guest");
      }
    } else {
      setName("Guest");
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Dashboard, {name} 👋
      </h1>
      <p className="text-gray-600">
        Select an option from the sidebar to get started.
      </p>
    </div>
  );
}
