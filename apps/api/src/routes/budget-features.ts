import { Elysia, t } from "elysia";
import {
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
} from "../../../../packages/database/index.ts";

export const budgetFeaturesRoute = new Elysia()
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    // ===== BUDGET GOALS =====
    .post("/budget-goals", async ({ body, set }) => {
        try {
            const goal = await createBudgetGoal(
                body.userEmail,
                body.category,
                body.limitAmount,
                body.period || "monthly",
            );
            set.status = 201;
            return { message: "Budget goal created", data: goal };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to create budget goal" };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            category: t.String(),
            limitAmount: t.Number(),
            period: t.Optional(t.Union([t.Literal("monthly"), t.Literal("weekly"), t.Literal("yearly")])),
        }),
    })
    .get("/budget-goals", async ({ query, set }) => {
        try {
            const goals = await getBudgetGoals(query.userEmail);
            return { data: goals };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to retrieve budget goals" };
        }
    }, {
        query: t.Object({ userEmail: t.String() }),
    })
    .delete("/budget-goals/:id", async ({ params, query, set }) => {
        try {
            await deleteBudgetGoal(params.id, query.userEmail);
            return { message: "Budget goal deleted" };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to delete budget goal" };
        }
    }, {
        params: t.Object({ id: t.String() }),
        query: t.Object({ userEmail: t.String() }),
    })

    // ===== RECURRING TRANSACTIONS =====
    .post("/recurring-transactions", async ({ body, set }) => {
        try {
            const recurring = await createRecurringTransaction(body.userEmail, {
                label: body.label,
                amount: body.amount,
                currency: body.currency,
                category: body.category,
                type: body.type,
                frequency: body.frequency,
                startDate: body.startDate,
                endDate: body.endDate,
            });
            set.status = 201;
            return { message: "Recurring transaction created", data: recurring };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to create recurring transaction" };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            label: t.String(),
            amount: t.Number(),
            currency: t.Optional(t.String()),
            category: t.Optional(t.String()),
            type: t.Union([t.Literal("expense"), t.Literal("income")]),
            frequency: t.Union([t.Literal("weekly"), t.Literal("biweekly"), t.Literal("monthly"), t.Literal("quarterly"), t.Literal("yearly")]),
            startDate: t.String(),
            endDate: t.Optional(t.String()),
        }),
    })
    .get("/recurring-transactions", async ({ query, set }) => {
        try {
            const recurring = await getRecurringTransactions(query.userEmail);
            return { data: recurring };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to retrieve recurring transactions" };
        }
    }, {
        query: t.Object({ userEmail: t.String() }),
    })
    .patch("/recurring-transactions/:id/toggle", async ({ params, query, set }) => {
        try {
            await toggleRecurringTransaction(params.id, query.userEmail);
            return { message: "Recurring transaction toggled" };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to toggle recurring transaction" };
        }
    }, {
        params: t.Object({ id: t.String() }),
        query: t.Object({ userEmail: t.String() }),
    })

    // ===== ADVANCED FILTERING =====
    .post("/transactions/filter", async ({ body, set }) => {
        try {
            const transactions = await filterTransactions(body.userEmail, body.filters);
            return { data: transactions };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to filter transactions" };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            filters: t.Object({
                category: t.Optional(t.String()),
                type: t.Optional(t.Union([t.Literal("expense"), t.Literal("income")])),
                minAmount: t.Optional(t.Number()),
                maxAmount: t.Optional(t.Number()),
                startDate: t.Optional(t.String()),
                endDate: t.Optional(t.String()),
                search: t.Optional(t.String()),
            }),
        }),
    })

    // ===== BATCH OPERATIONS =====
    .post("/transactions/batch-delete", async ({ body, set }) => {
        try {
            const result = await batchDeleteTransactions(body.userEmail, body.transactionIds);
            return { message: `Deleted ${result.deleted} transactions`, data: result };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to delete transactions" };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            transactionIds: t.Array(t.String()),
        }),
    })
    .patch("/transactions/batch-update", async ({ body, set }) => {
        try {
            const result = await batchUpdateTransactions(body.userEmail, body.updates);
            return { message: `Updated ${result.updated} transactions`, data: result };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to update transactions" };
        }
    }, {
        body: t.Object({
            userEmail: t.String(),
            updates: t.Array(
                t.Object({
                    id: t.String(),
                    category: t.Optional(t.String()),
                    label: t.Optional(t.String()),
                }),
            ),
        }),
    })

    // ===== BUDGET ALERTS =====
    .get("/budget-alerts/check", async ({ query, set }) => {
        try {
            const alerts = await checkBudgetAlerts(query.userEmail, query.period || "monthly");
            return { data: alerts };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to check budget alerts" };
        }
    }, {
        query: t.Object({
            userEmail: t.String(),
            period: t.Optional(t.Union([t.Literal("monthly"), t.Literal("weekly")])),
        }),
    })
    .get("/budget-alerts", async ({ query, set }) => {
        try {
            const alerts = await getBudgetAlerts(query.userEmail);
            return { data: alerts };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to retrieve budget alerts" };
        }
    }, {
        query: t.Object({ userEmail: t.String() }),
    })
    .patch("/budget-alerts/:id/read", async ({ params, query, set }) => {
        try {
            await markAlertAsRead(params.id, query.userEmail);
            return { message: "Alert marked as read" };
        } catch (error) {
            set.status = 400;
            return { error: error instanceof Error ? error.message : "Failed to mark alert as read" };
        }
    }, {
        params: t.Object({ id: t.String() }),
        query: t.Object({ userEmail: t.String() }),
    });
