import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Seed users
  const adminPassword = await bcrypt.hash("admin", 10);
  const analystPassword = await bcrypt.hash("analyst", 10);
  const investigatorPassword = await bcrypt.hash("investigator", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  const analyst = await prisma.user.upsert({
    where: { username: "analyst" },
    update: {},
    create: {
      username: "analyst",
      password: analystPassword,
      name: "Fraud Analyst",
      role: "ANALYST",
    },
  });

  const investigator = await prisma.user.upsert({
    where: { username: "investigator" },
    update: {},
    create: {
      username: "investigator",
      password: investigatorPassword,
      name: "Senior Investigator",
      role: "INVESTIGATOR",
    },
  });

  console.log("Users seeded:", { admin, analyst, investigator });

  // Seed accounts
  const accountsData = [
    { accountNumber: "1000000001", accountHolder: "Budi Santoso", balance: 25000000, riskScore: 15, status: "ACTIVE" },
    { accountNumber: "1000000002", accountHolder: "Ani Wijaya", balance: 45000000, riskScore: 25, status: "ACTIVE" },
    { accountNumber: "1000000003", accountHolder: "Dedi Pratama", balance: 12000000, riskScore: 55, status: "FLAGGED" },
    { accountNumber: "1000000004", accountHolder: "Siti Aminah", balance: 8000000, riskScore: 78, status: "RESTRICTED" },
    { accountNumber: "1000000005", accountHolder: "Rudi Hartono", balance: 5000000, riskScore: 95, status: "FROZEN" },
    { accountNumber: "1000000006", accountHolder: "Maya Sari", balance: 67000000, riskScore: 10, status: "ACTIVE" },
    { accountNumber: "1000000007", accountHolder: "Joko Widodo", balance: 34000000, riskScore: 42, status: "ACTIVE" },
    { accountNumber: "1000000008", accountHolder: "Rina Susanti", balance: 15000000, riskScore: 88, status: "RESTRICTED" },
    { accountNumber: "1000000009", accountHolder: "Ahmad Fauzi", balance: 9200000, riskScore: 65, status: "FLAGGED" },
    { accountNumber: "1000000010", accountHolder: "Dewi Kusuma", balance: 55000000, riskScore: 5, status: "ACTIVE" },
  ];

  const accounts = [];
  for (const acc of accountsData) {
    const account = await prisma.account.upsert({
      where: { accountNumber: acc.accountNumber },
      update: {},
      create: {
        accountNumber: acc.accountNumber,
        userId: 1,
        accountHolder: acc.accountHolder,
        balance: acc.balance,
        riskScore: acc.riskScore,
        status: acc.status as any,
      },
    });
    accounts.push(account);
  }

  console.log("Accounts seeded:", accounts.length);

  // Seed transactions
  const channels = ["ATM", "Mobile Banking", "Internet Banking", "Branch"];
  const transactions = [];
  for (let i = 0; i < 50; i++) {
    const sender = accounts[Math.floor(Math.random() * accounts.length)];
    let recipient = accounts[Math.floor(Math.random() * accounts.length)];
    while (recipient.id === sender.id) {
      recipient = accounts[Math.floor(Math.random() * accounts.length)];
    }

    const amount = Math.floor(Math.random() * 5000000) + 50000;
    const isAnomaly = Math.random() > 0.85;

    const tx = await prisma.transaction.create({
      data: {
        senderId: sender.id,
        recipientId: recipient.id,
        amount: amount,
        channel: channels[Math.floor(Math.random() * channels.length)],
        locationIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceId: `device-${Math.floor(Math.random() * 1000)}`,
        isAnomaly,
        description: isAnomaly ? "Unusual transaction pattern detected" : "Regular transfer",
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      },
    });
    transactions.push(tx);
  }

  console.log("Transactions seeded:", transactions.length);

  // Seed complaints
  const complaintCategories = ["PHISHING", "SKIMMING", "SOCIAL_ENGINEERING", "UNAUTHORIZED_TRANSACTION", "ACCOUNT_TAKEOVER", "OTHER"];
  const complaints = [];
  for (let i = 0; i < 15; i++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const category = complaintCategories[Math.floor(Math.random() * complaintCategories.length)];
    const priority = Math.floor(Math.random() * 100);

    const complaint = await prisma.complaint.create({
      data: {
        ticketId: `CMP-${Date.now()}-${i}`,
        accountId: account.id,
        category: category as any,
        description: `Customer reported ${category.toLowerCase().replace("_", " ")} incident involving account ${account.accountNumber}.`,
        aiPriorityScore: priority,
        sentiment: priority > 70 ? "Negative" : priority > 40 ? "Neutral" : "Positive",
        status: ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED"][Math.floor(Math.random() * 4)] as any,
      },
    });
    complaints.push(complaint);
  }

  console.log("Complaints seeded:", complaints.length);

  // Seed freeze log for frozen account
  const frozenAccount = accounts.find((a) => a.status === "FROZEN");
  if (frozenAccount) {
    await prisma.freezeLog.create({
      data: {
        accountId: frozenAccount.id,
        reasonCode: "07",
        triggeredBy: "SYSTEM",
        freezeDuration: 720,
      },
    });
    console.log("Freeze log seeded for account", frozenAccount.accountNumber);
  }

  // Seed AI rules
  const rulesData = [
    {
      name: "High Value Offshore Transaction",
      description: "Flag transactions over Rp 10M from outside Indonesia on new accounts",
      severity: "HIGH",
      logicJson: {
        trigger: { type: "TRANSACTION_EVENT", label: "Transaction Event" },
        conditions: {
          operator: "AND",
          conditions: [
            { id: "c1", source: "TRANSACTION", field: "amount", operator: "GT", value: "10000000", label: "Amount > Rp 10,000,000" },
            { id: "c2", source: "TRANSACTION", field: "locationIp", operator: "NEQ", value: "Indonesia", label: "IP Outside Indonesia" },
            { id: "c3", source: "ACCOUNT", field: "accountAge", operator: "LT", value: "30", label: "Account Age < 30 days" },
          ],
        },
        action: { type: "FLAG_FOR_REVIEW", label: "Flag for Review" },
      },
    },
    {
      name: "Suspicious Velocity & Mule Detection",
      description: "Auto-freeze accounts receiving rapid funds from multiple sources",
      severity: "CRITICAL",
      logicJson: {
        trigger: { type: "BULK_TRANSFER", label: "Bulk Transfer" },
        conditions: {
          operator: "AND",
          conditions: [
            { id: "c1", source: "TRANSACTION", field: "velocity", operator: "GTE", value: "5", label: "Velocity >= 5 tx in short time" },
            { id: "c2", source: "TRANSACTION", field: "sameRecipientCount", operator: "GTE", value: "3", label: "Same Recipient Count >= 3" },
            { id: "c3", source: "ACCOUNT", field: "riskScore", operator: "GTE", value: "50", label: "Risk Score >= 50" },
          ],
        },
        action: { type: "AUTO_FREEZE", label: "Auto Freeze (Sandi 07)" },
      },
    },
    {
      name: "Off-Hours Anomaly Detection",
      description: "Flag large transactions occurring outside business hours from unknown devices",
      severity: "MEDIUM",
      logicJson: {
        trigger: { type: "TRANSACTION_EVENT", label: "Transaction Event" },
        conditions: {
          operator: "AND",
          conditions: [
            { id: "c1", source: "TRANSACTION", field: "isOffHours", operator: "EQ", value: "true", label: "Off-Hours (00:00-05:00)" },
            { id: "c2", source: "TRANSACTION", field: "amount", operator: "GT", value: "5000000", label: "Amount > Rp 5,000,000" },
          ],
        },
        action: { type: "FLAG_FOR_REVIEW", label: "Flag for Review" },
      },
    },
    {
      name: "Complaint-Linked Account Freeze",
      description: "Freeze accounts with high risk score that have pending fraud complaints",
      severity: "CRITICAL",
      logicJson: {
        trigger: { type: "COMPLAINT_FILED", label: "Complaint Filed" },
        conditions: {
          operator: "AND",
          conditions: [
            { id: "c1", source: "ACCOUNT", field: "riskScore", operator: "GTE", value: "70", label: "Risk Score >= 70" },
            { id: "c2", source: "COMPLAINT", field: "complaintCategory", operator: "IN", value: ["PHISHING", "ACCOUNT_TAKEOVER"], label: "Complaint Category in Phishing/Account Takeover" },
            { id: "c3", source: "COMPLAINT", field: "complaintSentiment", operator: "EQ", value: "Negative", label: "Complaint Sentiment = Negative" },
          ],
        },
        action: { type: "AUTO_FREEZE", label: "Auto Freeze (Sandi 07)" },
      },
    },
    {
      name: "Weekend High-Risk Alert",
      description: "Flag high-value weekend transactions from accounts with elevated risk",
      severity: "MEDIUM",
      logicJson: {
        trigger: { type: "TRANSACTION_EVENT", label: "Transaction Event" },
        conditions: {
          operator: "AND",
          conditions: [
            { id: "c1", source: "TRANSACTION", field: "isWeekend", operator: "EQ", value: "true", label: "Weekend Transaction" },
            { id: "c2", source: "TRANSACTION", field: "amount", operator: "GT", value: "20000000", label: "Amount > Rp 20,000,000" },
            { id: "c3", source: "ACCOUNT", field: "riskScore", operator: "GTE", value: "40", label: "Risk Score >= 40" },
          ],
        },
        action: { type: "FLAG_FOR_REVIEW", label: "Flag for Review" },
      },
    },
  ];

  // Remove old system-seeded rules, re-insert fresh
  await prisma.aIRule.deleteMany({ where: { createdBy: "SYSTEM" } });
  for (const ruleData of rulesData) {
    await prisma.aIRule.create({
      data: {
        name: ruleData.name,
        description: ruleData.description,
        severity: ruleData.severity,
        logicJson: ruleData.logicJson as any,
        isActive: true,
        createdBy: "SYSTEM",
      },
    });
  }
  console.log("AI rules seeded:", rulesData.length);

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
