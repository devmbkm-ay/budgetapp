import { scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./client";

export interface CreateTransactionInput {
  amount: number;
  category?: string | null;
  currency?: string;
  date?: string;
  label: string;
  type: "expense" | "income";
  userEmail: string;
}

export interface UpdateTransactionInput {
  amount: number;
  category?: string | null;
  currency?: string;
  date?: string;
  label: string;
  transactionId: string;
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

type TransactionWithUser = Awaited<ReturnType<typeof prisma.transaction.findFirstOrThrow<{ include: { user: true } }>>>;

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

export interface UpdateUserProfileInput {
  userId: string;
  name?: string | null;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<SessionUser> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });

  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw new Error("Le mot de passe actuel est requis.");
    }
    if (!verifyPassword(input.currentPassword, user.passwordHash)) {
      throw new Error("Mot de passe actuel incorrect.");
    }
  }

  if (input.email && input.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error("Cet email est déjà utilisé.");
    }
  }

  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email && { email: input.email }),
      ...(input.newPassword && { passwordHash: hashPassword(input.newPassword) }),
    },
  });

  return mapSessionUser(updated);
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

export async function getTransactionById(transactionId: string, userEmail: string): Promise<TransactionRecord> {
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

  return mapTransactionRecord(transaction);
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<TransactionRecord> {
  const normalizedAmount = Math.abs(input.amount);
  const signedAmount = input.type === "expense" ? -normalizedAmount : normalizedAmount;
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: input.transactionId,
      user: {
        email: input.userEmail,
      },
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction introuvable.");
  }

  const transaction = await prisma.transaction.update({
    where: {
      id: input.transactionId,
    },
    data: {
      amount: signedAmount,
      category: input.category ?? null,
      currency: input.currency ?? existingTransaction.currency,
      date: input.date ? new Date(input.date) : existingTransaction.date,
      label: input.label,
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

export async function listTransactionsByDateRange(
  userEmail: string,
  startDate: Date,
  endDate: Date,
): Promise<TransactionRecord[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
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

export {
  createBudgetGoal,
  getBudgetGoals,
  deleteBudgetGoal,
  createRecurringTransaction,
  getRecurringTransactions,
  toggleRecurringTransaction,
  filterTransactions,
  batchDeleteTransactions,
  batchUpdateTransactions,
  checkBudgetAlerts,
  getBudgetAlerts,
  markAlertAsRead,
  type FilterOptions,
  type BudgetAlertData,
} from "./budget-functions";
