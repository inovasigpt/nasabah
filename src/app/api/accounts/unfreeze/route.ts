import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session || (session.role !== "INVESTIGATOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const accountId = parseInt(formData.get("accountId") as string, 10);

    if (!accountId || isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
    }

    // Update account status
    await prisma.account.update({
      where: { id: accountId },
      data: { status: "ACTIVE", riskScore: 50 },
    });

    // Update freeze log
    await prisma.freezeLog.updateMany({
      where: { accountId, unfrozenAt: null },
      data: {
        unfrozenAt: new Date(),
        unfrozenBy: session.name,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UNFREEZE",
        entity: "Account",
        entityId: String(accountId),
        details: { reason: "Manual unfreeze by investigator", previousStatus: "FROZEN" },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfreeze error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
