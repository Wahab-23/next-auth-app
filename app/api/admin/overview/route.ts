import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1] || "";
        const user = await getUserFromToken(token);

        if (!user || user.role?.name !== "Admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // helper: count business days between start (inclusive) and end (inclusive)
        function countBusinessDays(start: Date, end: Date) {
            let count = 0;
            const cur = new Date(start);
            while (cur <= end) {
                const day = cur.getDay();
                if (day !== 0 && day !== 7) count++;
                cur.setDate(cur.getDate() + 1);
            }
            return count;
        }

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
        const workingDaysInMonth = countBusinessDays(monthStart, monthEnd);

        // fetch merchandisers (same as before)
        const merchandisers = await prisma.user.findMany({
            where: { role: { name: "Merchandiser" } },
            select: { id: true, name: true, email: true}, // include if available
        });

        // get all records for the month (same as before)
        const records = await prisma.record.findMany({
            where: { date: { gte: monthStart, lte: monthEnd } },
        });

        // Build per-user stats
        const stats = merchandisers.map((m: any) => {
            const userRecords = records.filter((r: any) => r.userId === m.id);

            const totalUploads = userRecords.reduce((sum, r) => sum + r.equivalentUploads, 0);

            // Determine monthly target:
            // Priority:
            // 1) user.monthlyTarget if present
            // 2) user.dailyTarget * workingDaysInMonth if present
            // 3) fallback: defaultDailyTarget (50) * workingDaysInMonth
            const defaultDailyTarget = 50;
            const dailyTarget = defaultDailyTarget;
            const monthlyTarget = dailyTarget * workingDaysInMonth;

            const percentage = monthlyTarget > 0 ? Math.round((totalUploads / monthlyTarget) * 100) : 0;

            return {
                id: m.id,
                name: m.name,
                email: m.email,
                monthlyUploads: Math.round(totalUploads),
                monthlyTarget,
                achievedPercentage: percentage,
            };
        });

        return NextResponse.json({ merchandisers: stats });
    } catch (error) {
        console.error("Admin Overview Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
