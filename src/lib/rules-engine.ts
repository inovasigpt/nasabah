import type { RuleDefinition, ConditionConfig, ConditionOperator } from "@/types/rules";

interface EvaluationContext {
  amount?: number;
  channel?: string;
  locationIp?: string;
  deviceId?: string;
  isWeekend?: boolean;
  isOffHours?: boolean;
  velocity?: number;
  sameRecipientCount?: number;
  accountAge?: number;
  riskScore?: number;
  accountStatus?: string;
  balanceDrop?: number;
  hasOpenComplaint?: boolean;
  complaintCategory?: string;
  complaintSentiment?: string;
  sameIpAsFraud?: boolean;
  sameDeviceAsFraud?: boolean;
  connectedToFraud?: number;
}

function compareValue(
  actual: number | string | boolean | undefined,
  operator: ConditionOperator,
  expected: string | number | string[]
): boolean {
  if (actual === undefined) return false;

  switch (operator) {
    case "GT":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "GTE":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "LT":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "LTE":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "EQ":
      return String(actual).toLowerCase() === String(expected).toLowerCase();
    case "NEQ":
      return String(actual).toLowerCase() !== String(expected).toLowerCase();
    case "IN":
      return Array.isArray(expected) && expected.map(String).includes(String(actual));
    case "NOT_IN":
      return Array.isArray(expected) && !expected.map(String).includes(String(actual));
    case "CONTAINS":
      return String(actual).toLowerCase().includes(String(expected).toLowerCase());
    default:
      return false;
  }
}

function evaluateCondition(condition: ConditionConfig, ctx: EvaluationContext): boolean {
  const actualValue = getContextValue(condition.source, condition.field, ctx);
  return compareValue(actualValue, condition.operator, condition.value);
}

function getContextValue(
  source: string,
  field: string,
  ctx: EvaluationContext
): number | string | boolean | undefined {
  if (source === "TRANSACTION") {
    switch (field) {
      case "amount": return ctx.amount;
      case "channel": return ctx.channel;
      case "locationIp": return ctx.locationIp;
      case "deviceId": return ctx.deviceId;
      case "isWeekend": return ctx.isWeekend;
      case "isOffHours": return ctx.isOffHours;
      case "velocity": return ctx.velocity;
      case "sameRecipientCount": return ctx.sameRecipientCount;
    }
  }
  if (source === "ACCOUNT") {
    switch (field) {
      case "accountAge": return ctx.accountAge;
      case "riskScore": return ctx.riskScore;
      case "accountStatus": return ctx.accountStatus;
      case "balanceDrop": return ctx.balanceDrop;
    }
  }
  if (source === "COMPLAINT") {
    switch (field) {
      case "hasOpenComplaint": return ctx.hasOpenComplaint;
      case "complaintCategory": return ctx.complaintCategory;
      case "complaintSentiment": return ctx.complaintSentiment;
    }
  }
  if (source === "NETWORK") {
    switch (field) {
      case "sameIpAsFraud": return ctx.sameIpAsFraud;
      case "sameDeviceAsFraud": return ctx.sameDeviceAsFraud;
      case "connectedToFraud": return ctx.connectedToFraud;
    }
  }
  return undefined;
}

export function evaluateRule(definition: RuleDefinition, ctx: EvaluationContext): boolean {
  const conditions = definition.conditions;

  if (conditions.conditions.length === 0) return true;

  if (conditions.operator === "AND") {
    return conditions.conditions.every((c) => evaluateCondition(c, ctx));
  } else {
    return conditions.conditions.some((c) => evaluateCondition(c, ctx));
  }
}

export function generateExplanation(
  definition: RuleDefinition,
  ctx: EvaluationContext,
  matched: boolean
): string {
  if (!matched) return "No conditions triggered.";

  const triggerLabel = definition.trigger.label || definition.trigger.type;
  const actionLabel = definition.action.label || definition.action.type;

  const matchedConditions = definition.conditions.conditions
    .filter((c) => {
      const val = getContextValue(c.source, c.field, ctx);
      return compareValue(val, c.operator, c.value);
    })
    .map((c) => c.label || `${c.source}.${c.field} ${c.operator} ${c.value}`);

  if (matchedConditions.length === 0) return `Rule "${triggerLabel}" triggered but no specific conditions matched.`;

  let explanation = `Trigger: ${triggerLabel}. `;
  explanation += `Matched conditions: ${matchedConditions.join(", ")}. `;
  explanation += `Action: ${actionLabel}.`;

  return explanation;
}
