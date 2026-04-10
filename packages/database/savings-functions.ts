import { prisma } from "./client";

export interface SavingsGoalRecord {
  id: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  currency: string;
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalInput {
  label: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string | null;
  currency?: string;
  emoji?: string | null;
  userEmail: string;
}

export async function createSavingsGoal(input: CreateSavingsGoalInput): Promise<SavingsGoalRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: input.userEmail } });
  const goal = await prisma.savingsGoal.create({
    data: {
      label: input.label,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount ?? 0,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      currency: input.currency ?? "EUR",
      emoji: input.emoji ?? null,
      userId: user.id,
    },
  });
  return mapGoal(goal);
}

export async function getSavingsGoals(userEmail: string): Promise<SavingsGoalRecord[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return goals.map(mapGoal);
}

export async function updateSavingsGoal(
  id: string,
  userEmail: string,
  data: {
    label?: string;
    targetAmount?: number;
    currentAmount?: number;
    targetDate?: string | null;
    emoji?: string | null;
  },
): Promise<SavingsGoalRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const goal = await prisma.savingsGoal.update({
    where: { id, userId: user.id },
    data: {
      ...data,
      targetDate: data.targetDate !== undefined
        ? (data.targetDate ? new Date(data.targetDate) : null)
        : undefined,
    },
  });
  return mapGoal(goal);
}

export async function deleteSavingsGoal(id: string, userEmail: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  await prisma.savingsGoal.delete({ where: { id, userId: user.id } });
}

function mapGoal(g: {
  id: string; label: string; targetAmount: number; currentAmount: number;
  targetDate: Date | null; currency: string; emoji: string | null;
  createdAt: Date; updatedAt: Date;
}): SavingsGoalRecord {
  return {
    id: g.id, label: g.label,
    targetAmount: g.targetAmount, currentAmount: g.currentAmount,
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    currency: g.currency, emoji: g.emoji,
    createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString(),
  };
}
