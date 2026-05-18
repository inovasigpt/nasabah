import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { evaluateRule, generateExplanation } from "@/lib/rules-engine";
import type { RuleDefinition } from "@/types/rules";

export const dynamic = "force-dynamic";

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
    const { logicJson, context } = body as {
      logicJson: RuleDefinition;
      context: Record<string, unknown>;
    };

    if (!logicJson) {
      return NextResponse.json({ error: "logicJson is required" }, { status: 400 });
    }

    const matched = evaluateRule(logicJson, context as any);
    const explanation = generateExplanation(logicJson, context as any, matched);

    return NextResponse.json({
      matched,
      explanation,
      context,
    });
  } catch (error) {
    console.error("Error testing rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
