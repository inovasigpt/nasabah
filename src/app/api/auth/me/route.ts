import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      role: session.role,
      name: session.name,
    },
  });
}
