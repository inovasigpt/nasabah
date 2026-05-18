import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await prisma.aIRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "ANALYST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, severity, logicJson, isActive } = body;

    if (!name || !logicJson) {
      return NextResponse.json({ error: "Name and logicJson are required" }, { status: 400 });
    }

    const rule = await prisma.aIRule.create({
      data: {
        name,
        description: description || null,
        severity: severity || "MEDIUM",
        logicJson,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.username,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "RULE_CREATED",
        entity: "AIRule",
        entityId: String(rule.id),
        details: { name },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
