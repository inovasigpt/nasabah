import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password } = await request.json();

    // Already handled in login route, but log for audit
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "LOGIN",
        entity: "User",
        entityId: String(session.userId),
        details: { username },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
