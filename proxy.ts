import { get } from "http";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromToken } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = await getUserFromToken(token || "");

  const { pathname } = req.nextUrl;


  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  if (user?.role?.name === "Admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  
  if (user?.role?.name === "Merchandiser" && pathname === "/") {
    return NextResponse.redirect(new URL("/merchandiser", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};