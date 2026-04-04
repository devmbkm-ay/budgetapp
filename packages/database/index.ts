import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

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
  note?: string;
  type: "expense" | "income";
  userEmail: string;
  userName?: string | null;
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

export async function createTransaction(input: CreateTransactionInput): Promise<TransactionRecord> {
  const normalizedAmount = Math.abs(input.amount);
  const signedAmount = input.type === "expense" ? -normalizedAmount : normalizedAmount;
  const user = await prisma.user.upsert({
    where: { email: input.userEmail },
    update: {
      name: input.userName ?? undefined,
    },
    create: {
      email: input.userEmail,
      name: input.userName ?? null,
    },
  });

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

export async function listTransactions(): Promise<TransactionRecord[]> {
  const transactions = await prisma.transaction.findMany({
    include: {
      user: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => mapTransactionRecord(transaction));
}
