// Budget Goals, Recurring Transactions, Filters, Batch Operations, and Alerts
import { PrismaClient } from "@prisma/client";

export async function createBudgetGoal(
    userEmail: string,
    category: string,
    limitAmount: number,
    period: "monthly" | "weekly" | "yearly" = "monthly",
): Promise<{ id: string; category: string; limitAmount: number; period: string }> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const goal = await prisma.budgetGoal.upsert({
        where: {
            userId_category_period: {
                userId: user.id,
                category,
                period,
            },
        },
        update: {
            limitAmount,
        },
        create: {
            userId: user.id,
            category,
            limitAmount,
            period,
        },
    });

    return {
        id: goal.id,
        category: goal.category,
        limitAmount: goal.limitAmount,
        period: goal.period,
    };
}

export async function getBudgetGoals(userEmail: string): Promise<Array<{ id: string; category: string; limitAmount: number; period: string }>> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const goals = await prisma.budgetGoal.findMany({
        where: { userId: user.id },
    });

    return goals.map((g) => ({
        id: g.id,
        category: g.category,
        limitAmount: g.limitAmount,
        period: g.period,
    }));
}

export async function deleteBudgetGoal(goalId: string, userEmail: string): Promise<boolean> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    await prisma.budgetGoal.deleteMany({
        where: { id: goalId, userId: user.id },
    });

    return true;
}

// Recurring Transactions
export async function createRecurringTransaction(
    userEmail: string,
    data: {
        label: string;
        amount: number;
        currency?: string;
        category?: string;
        type: "expense" | "income";
        frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
        startDate: string;
        endDate?: string;
    },
): Promise<{ id: string; label: string; frequency: string }> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const recurring = await prisma.recurringTransaction.create({
        data: {
            userId: user.id,
            label: data.label,
            amount: data.amount,
            currency: data.currency || "EUR",
            category: data.category,
            type: data.type,
            frequency: data.frequency,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
        },
    });

    return {
        id: recurring.id,
        label: recurring.label,
        frequency: recurring.frequency,
    };
}

export async function getRecurringTransactions(userEmail: string): Promise<Array<{ id: string; label: string; frequency: string; isActive: boolean }>> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const recurring = await prisma.recurringTransaction.findMany({
        where: { userId: user.id },
    });

    return recurring.map((r) => ({
        id: r.id,
        label: r.label,
        frequency: r.frequency,
        isActive: r.isActive,
    }));
}

export async function toggleRecurringTransaction(recurringId: string, userEmail: string): Promise<boolean> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const recurring = await prisma.recurringTransaction.findUniqueOrThrow({
        where: { id: recurringId },
    });

    if (recurring.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.recurringTransaction.update({
        where: { id: recurringId },
        data: { isActive: !recurring.isActive },
    });

    return true;
}

// Advanced Filtering
export interface FilterOptions {
    category?: string;
    type?: "expense" | "income";
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export async function filterTransactions(userEmail: string, options: FilterOptions): Promise<Array<{ id: string; label: string; amount: number; category: string | null; type: string; date: string }>> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const where: any = {
        userId: user.id,
    };

    if (options.category) {
        where.category = options.category;
    }

    if (options.type) {
        where.type = options.type;
    }

    if (options.minAmount !== undefined || options.maxAmount !== undefined) {
        where.amount = {};
        if (options.minAmount !== undefined) {
            where.amount.gte = options.minAmount;
        }
        if (options.maxAmount !== undefined) {
            where.amount.lte = options.maxAmount;
        }
    }

    if (options.startDate || options.endDate) {
        where.date = {};
        if (options.startDate) {
            where.date.gte = new Date(options.startDate);
        }
        if (options.endDate) {
            where.date.lte = new Date(options.endDate);
        }
    }

    if (options.search) {
        where.OR = [
            { label: { contains: options.search, mode: "insensitive" } },
            { category: { contains: options.search, mode: "insensitive" } },
        ];
    }

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
    });

    return transactions.map((t) => ({
        id: t.id,
        label: t.label,
        amount: t.amount,
        category: t.category,
        type: t.type,
        date: t.date.toISOString(),
    }));
}

// Batch Operations
export async function batchDeleteTransactions(userEmail: string, transactionIds: string[]): Promise<{ deleted: number }> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const result = await prisma.transaction.deleteMany({
        where: {
            id: { in: transactionIds },
            userId: user.id,
        },
    });

    return { deleted: result.count };
}

export async function batchUpdateTransactions(
    userEmail: string,
    updates: Array<{ id: string; category?: string; label?: string }>,
): Promise<{ updated: number }> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    let updated = 0;
    for (const update of updates) {
        await prisma.transaction.updateMany({
            where: {
                id: update.id,
                userId: user.id,
            },
            data: {
                ...(update.category && { category: update.category }),
                ...(update.label && { label: update.label }),
            },
        });
        updated++;
    }

    return { updated };
}

// Budget Alerts
export interface BudgetAlertData {
    id: string;
    category: string;
    message: string;
    type: "warning" | "critical";
    currentAmount: number;
    limitAmount: number;
    isRead: boolean;
}

export async function checkBudgetAlerts(userEmail: string, period: "monthly" | "weekly" = "monthly"): Promise<BudgetAlertData[]> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const budgetGoals = await prisma.budgetGoal.findMany({
        where: { userId: user.id, period },
    });

    const alerts: BudgetAlertData[] = [];

    for (const goal of budgetGoals) {
        // Calculate spent in current period
        let startDate: Date;
        const now = new Date();

        if (period === "monthly") {
            startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        } else {
            // Assuming week starts on Monday
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
        }

        const spent = await prisma.transaction.aggregate({
            where: {
                userId: user.id,
                category: goal.category,
                type: "expense",
                date: { gte: startDate },
            },
            _sum: { amount: true },
        });

        const currentAmount = spent._sum.amount || 0;
        const percentUsed = (currentAmount / goal.limitAmount) * 100;

        if (percentUsed >= 100) {
            alerts.push({
                id: `${goal.id}-critical`,
                category: goal.category,
                message: `Budget limit exceeded for ${goal.category}. Current: €${currentAmount.toFixed(2)} / Limit: €${goal.limitAmount.toFixed(2)}`,
                type: "critical",
                currentAmount,
                limitAmount: goal.limitAmount,
                isRead: false,
            });
        } else if (percentUsed >= 80) {
            alerts.push({
                id: `${goal.id}-warning`,
                category: goal.category,
                message: `Approaching budget limit for ${goal.category} (${percentUsed.toFixed(0)}% used)`,
                type: "warning",
                currentAmount,
                limitAmount: goal.limitAmount,
                isRead: false,
            });
        }
    }

    return alerts;
}

export async function getBudgetAlerts(userEmail: string): Promise<BudgetAlertData[]> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    const alerts = await prisma.budgetAlert.findMany({
        where: { userId: user.id, isRead: false },
        orderBy: { createdAt: "desc" },
    });

    return alerts.map((a) => ({
        id: a.id,
        category: a.category,
        message: a.message,
        type: a.type as "warning" | "critical",
        currentAmount: a.currentAmount,
        limitAmount: a.limitAmount,
        isRead: a.isRead,
    }));
}

export async function markAlertAsRead(alertId: string, userEmail: string): Promise<boolean> {
    const user = await prisma.user.findUniqueOrThrow({
        where: { email: userEmail },
    });

    await prisma.budgetAlert.updateMany({
        where: { id: alertId, userId: user.id },
        data: { isRead: true },
    });

    return true;
}
