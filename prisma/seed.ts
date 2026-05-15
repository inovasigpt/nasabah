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
