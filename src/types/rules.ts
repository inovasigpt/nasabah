export type TriggerType =
  | "TRANSACTION_EVENT"
  | "ACCOUNT_UPDATE"
  | "BULK_TRANSFER"
  | "COMPLAINT_FILED";

export type ConditionSource =
  | "TRANSACTION"
  | "ACCOUNT"
  | "COMPLAINT"
  | "DEVICE"
  | "NETWORK";

export type ConditionOperator =
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "EQ"
  | "NEQ"
  | "IN"
  | "NOT_IN"
  | "CONTAINS";

export type ActionType = "FLAG_FOR_REVIEW" | "AUTO_FREEZE";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TriggerConfig {
  type: TriggerType;
  label: string;
}

export interface ConditionConfig {
  id: string;
  source: ConditionSource;
  field: string;
  operator: ConditionOperator;
  value: string | number | string[];
  label: string;
}

export interface ConditionGroup {
  operator: "AND" | "OR";
  conditions: ConditionConfig[];
}

export interface ActionConfig {
  type: ActionType;
  label: string;
}

export interface RuleDefinition {
  trigger: TriggerConfig;
  conditions: ConditionGroup;
  action: ActionConfig;
}

export interface RuleNodeData {
  type: "trigger" | "condition" | "action";
  label: string;
  definition?: TriggerConfig | ConditionConfig | ConditionGroup | ActionConfig;
}

export interface SavedRule {
  id: number;
  name: string;
  description: string | null;
  severity: Severity;
  isActive: boolean;
  logicJson: RuleDefinition;
  createdBy: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export const TRIGGER_OPTIONS: { value: TriggerType; label: string; description: string }[] = [
  { value: "TRANSACTION_EVENT", label: "Transaction Event", description: "Triggered when a transaction occurs" },
  { value: "ACCOUNT_UPDATE", label: "Account Update", description: "Triggered when account profile changes" },
  { value: "BULK_TRANSFER", label: "Bulk Transfer", description: "Multiple transactions in short time" },
  { value: "COMPLAINT_FILED", label: "Complaint Filed", description: "Triggered when a complaint is registered" },
];

export const CONDITION_FIELDS: { value: string; source: ConditionSource; label: string; operators: ConditionOperator[] }[] = [
  { value: "amount", source: "TRANSACTION", label: "Amount (Rp)", operators: ["GT", "GTE", "LT", "LTE", "EQ"] },
  { value: "channel", source: "TRANSACTION", label: "Transaction Channel", operators: ["EQ", "NEQ", "IN", "NOT_IN"] },
  { value: "locationIp", source: "TRANSACTION", label: "IP Location", operators: ["EQ", "NEQ", "CONTAINS"] },
  { value: "deviceId", source: "TRANSACTION", label: "Device ID", operators: ["EQ", "NEQ", "IN", "NOT_IN"] },
  { value: "isWeekend", source: "TRANSACTION", label: "Weekend Transaction", operators: ["EQ"] },
  { value: "isOffHours", source: "TRANSACTION", label: "Off-Hours (00:00-05:00)", operators: ["EQ"] },
  { value: "velocity", source: "TRANSACTION", label: "Velocity (tx in X min)", operators: ["GT", "GTE", "LT", "LTE"] },
  { value: "sameRecipientCount", source: "TRANSACTION", label: "Same Recipient Count", operators: ["GT", "GTE"] },
  { value: "accountAge", source: "ACCOUNT", label: "Account Age (days)", operators: ["GT", "GTE", "LT", "LTE"] },
  { value: "riskScore", source: "ACCOUNT", label: "Risk Score", operators: ["GT", "GTE", "LT", "LTE", "EQ"] },
  { value: "accountStatus", source: "ACCOUNT", label: "Account Status", operators: ["EQ", "NEQ", "IN", "NOT_IN"] },
  { value: "balanceDrop", source: "ACCOUNT", label: "Balance Drop (%)", operators: ["GT", "GTE"] },
  { value: "hasOpenComplaint", source: "COMPLAINT", label: "Has Open Complaint", operators: ["EQ"] },
  { value: "complaintCategory", source: "COMPLAINT", label: "Complaint Category", operators: ["EQ", "IN"] },
  { value: "complaintSentiment", source: "COMPLAINT", label: "Complaint Sentiment", operators: ["EQ"] },
  { value: "sameIpAsFraud", source: "NETWORK", label: "Same IP as Known Fraud", operators: ["EQ"] },
  { value: "sameDeviceAsFraud", source: "NETWORK", label: "Same Device as Known Fraud", operators: ["EQ"] },
  { value: "connectedToFraud", source: "NETWORK", label: "Connected to Fraud (N hops)", operators: ["GTE"] },
];

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  GT: ">",
  GTE: ">=",
  LT: "<",
  LTE: "<=",
  EQ: "=",
  NEQ: "!=",
  IN: "in",
  NOT_IN: "not in",
  CONTAINS: "contains",
};

export const ACTION_OPTIONS: { value: ActionType; label: string; description: string }[] = [
  { value: "FLAG_FOR_REVIEW", label: "Flag for Review", description: "Set account status to FLAGGED and notify analysts" },
  { value: "AUTO_FREEZE", label: "Auto Freeze (Sandi 07)", description: "Freeze account per POJK 39/2019, log Sandi 07" },
];
