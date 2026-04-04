import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@prisma/client";

const moduleDir = typeof import.meta.dirname === "string"
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url));
const envPath = resolve(moduleDir, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && value && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:mysecretpassword@172.16.0.1:5432/budget_db";

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

export interface CreateTransactionInput {
  amount: number;
  category?: string | null;
  currency?: string;
  date?: string;
  label: string;
  type: "expense" | "income";
  userEmail: string;
}

export interface RegisterUserInput {
  email: string;
  name?: string | null;
  password: string;
}

export interface SessionUser {
  email: string;
  id: string;
  name: string | null;
}

export interface TransactionRecord {
  amount: number;
  category: string | null;
  currency: string;
  date: string;
  id: string;
  label: string;
  type: "expense" | "income";
  userEmail: string;
  userId: string;
  userName: string | null;
}

type TransactionWithUser = Prisma.TransactionGetPayload<{
  include: {
    user: true;
  };
}>;

function hashPassword(password: string) {
  const salt = "budgetapp-seed-salt";
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}

const mapSessionUser = (user: { id: string; email: string; name: string | null }): SessionUser => ({
  email: user.email,
  id: user.id,
  name: user.name,
});

const mapTransactionRecord = (transaction: TransactionWithUser): TransactionRecord => ({
  amount: Math.abs(transaction.amount),
  category: transaction.category,
  currency: transaction.currency,
  date: transaction.date.toISOString(),
  id: transaction.id,
  label: transaction.label,
  type: transaction.amount < 0 ? "expense" : "income",
  userEmail: transaction.user.email,
  userId: transaction.userId,
  userName: transaction.user.name,
});

export async function registerUser(input: RegisterUserInput): Promise<SessionUser> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("Un compte existe déjà avec cet email.");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
      passwordHash: hashPassword(input.password),
    },
  });

  return mapSessionUser(user);
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return mapSessionUser(user);
}

export async function getUserByEmail(email: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user ? mapSessionUser(user) : null;
}

export async function createTransaction(input: CreateTransactionInput): Promise<TransactionRecord> {
  const normalizedAmount = Math.abs(input.amount);
  const signedAmount = input.type === "expense" ? -normalizedAmount : normalizedAmount;
  const user = await prisma.user.findUnique({
    where: {
      email: input.userEmail,
    },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable pour cette transaction.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: signedAmount,
      category: input.category ?? null,
      currency: input.currency ?? "EUR",
      date: input.date ? new Date(input.date) : undefined,
      label: input.label,
      userId: user.id,
    },
    include: {
      user: true,
    },
  });

  return mapTransactionRecord(transaction);
}

export async function deleteTransaction(transactionId: string, userEmail: string): Promise<TransactionRecord> {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user: {
        email: userEmail,
      },
    },
    include: {
      user: true,
    },
  });

  if (!transaction) {
    throw new Error("Transaction introuvable.");
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return mapTransactionRecord(transaction);
}

export async function listTransactions(userEmail: string): Promise<TransactionRecord[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      user: {
        email: userEmail,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => mapTransactionRecord(transaction));
}
