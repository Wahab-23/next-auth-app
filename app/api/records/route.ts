// app/api/records/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);
    
    if (!user || user.role?.name !== "Merchandiser") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const creatorId = user.id;
    const body = await req.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await prisma.record.findFirst({
      where: { userId: creatorId, date: today },
    });

    const data = {
      productUploads: Number(body.productUploads || 0),
      reOptimizations: Number(body.reOptimizations || 0),
      priceUpdates: Number(body.priceUpdates || 0),
      priceComparisons: Number(body.priceComparisons || 0),
      stockUpdates: Number(body.stockUpdates || 0),
      csvUpdates: Number(body.csvUpdates || 0),
      comments: body.comments || null,
      attachmentUrl: body.attachmentUrl || null,
      equivalentUploads: 0,
      target: 0,
    };

    // ✅ Calculate Equivalent Uploads
    const equivalent =
      data.productUploads +
      data.reOptimizations / 3 +
      data.priceUpdates / 7 +
      data.priceComparisons / 5 +
      data.stockUpdates / 10 +
      data.csvUpdates * 10;

    data["equivalentUploads"] = Number(equivalent.toFixed(2));
    data["target"] = Number(body.target || 50);

    if (existingRecord) {
      const updated = await prisma.record.update({
        where: { id: existingRecord.id },
        data,
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.record.create({
      data: {
        userId: creatorId,
        date: today,
        ...data,
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error("POST /api/records error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1] || "";
    const user = await getUserFromToken(token);
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;

    if (user.role?.name === "Merchandiser") {
      const records = await prisma.record.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      });
      return NextResponse.json(records);
    }

    if (user.role?.name === "Admin") {
      const records = await prisma.record.findMany({
        orderBy: { date: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json(records);
    }

  } catch (err) {
    console.error("GET /api/records error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}