import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });
    if (!user) return false;
    return user.role?.name === "ADMIN";
  } catch (error) {
    console.error("verifyAdmin error:", error);
    return false;
  }
}
