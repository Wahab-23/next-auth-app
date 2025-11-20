import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    const isAdmin = user?.role?.name === "Admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const roles = await prisma.role.findMany({
      include: { _count: { select: { users: true } } },
    });
    return NextResponse.json(roles);
  }
  catch (error) {
    console.error("GET /api/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    const isAdmin = user?.role?.name === "Admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const role = await prisma.role.create({ data: { name } });
    return NextResponse.json({ message: "Role created", role });
  } catch (error) {
    console.error("POST /api/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    const isAdmin = user?.role?.name === "Admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    await prisma.role.deleteMany({ where: { name } });
    return NextResponse.json({ message: "Role deleted" });
  } catch (error) {
    console.error("DELETE /api/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);

    const isAdmin = user?.role?.name === "Admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Role id and new name are required" }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json({ message: "Role updated", role });
  } catch (error) {
    console.error("PATCH /api/roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}