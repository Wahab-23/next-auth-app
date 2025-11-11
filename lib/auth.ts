import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
      email: string;
    };
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function getUserFromToken(token?: string) {
  const decoded = verifyToken(token || "");
  if (!decoded?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { role: true },
  });
  return user;
}