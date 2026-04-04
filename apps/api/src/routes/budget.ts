import { Elysia, t } from "elysia";
import { createTransaction, deleteTransaction, getTransactionById, listTransactions, updateTransaction } from "../../../../packages/database/index.ts";

export const budgetRoute = new Elysia()
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    .options("/transactions", ({ set }) => {
        set.status = 204;
        return "";
    })
    .get("/budget", async ({ query, set }) => {
        if (!query.userEmail) {
            set.status = 400;
            return { error: "Le paramètre userEmail est requis." };
        }

        return listTransactions(query.userEmail);
    }, {
        query: t.Object({
            userEmail: t.String(),
        }),
    })
    .get("/transactions", async ({ query, set }) => {
        if (!query.userEmail) {
            set.status = 400;
            return { error: "Le paramètre userEmail est requis." };
        }

        return listTransactions(query.userEmail);
    }, {
        query: t.Object({
            userEmail: t.String(),
        }),
    })
    .get("/transactions/:id", async ({ params, query, set }) => {
        try {
            return await getTransactionById(params.id, query.userEmail);
        } catch (error) {
            set.status = 404;

            return {
                error: error instanceof Error ? error.message : "Transaction introuvable.",
            };
        }
    }, {
        params: t.Object({
            id: t.String(),
        }),
        query: t.Object({
            userEmail: t.String(),
        }),
    })
    .post("/transactions", async ({ body, set }) => {
        const transaction = await createTransaction(body);

        set.status = 201;

        return {
            message: "Transaction ajoutee",
            data: transaction,
        };
    }, {
        body: t.Object({
            amount: t.Number(),
            category: t.Optional(t.String()),
            currency: t.Optional(t.String()),
            date: t.String(),
            label: t.String(),
            note: t.Optional(t.String()),
            type: t.Union([t.Literal("expense"), t.Literal("income")]),
            userEmail: t.String(),
            userName: t.Optional(t.String()),
        })
    })
    .patch("/transactions/:id", async ({ body, params, set }) => {
        try {
            const transaction = await updateTransaction({
                ...body,
                transactionId: params.id,
            });

            return {
                message: "Transaction modifiée",
                data: transaction,
            };
        } catch (error) {
            set.status = 404;

            return {
                error: error instanceof Error ? error.message : "Transaction introuvable.",
            };
        }
    }, {
        params: t.Object({
            id: t.String(),
        }),
        body: t.Object({
            amount: t.Number(),
            category: t.Optional(t.String()),
            currency: t.Optional(t.String()),
            date: t.String(),
            label: t.String(),
            type: t.Union([t.Literal("expense"), t.Literal("income")]),
            userEmail: t.String(),
        }),
    })
    .delete("/transactions/:id", async ({ params, query, set }) => {
        try {
            const transaction = await deleteTransaction(params.id, query.userEmail);

            return {
                message: "Transaction supprimée",
                data: transaction,
            };
        } catch (error) {
            set.status = 404;

            return {
                error: error instanceof Error ? error.message : "Transaction introuvable.",
            };
        }
    }, {
        params: t.Object({
            id: t.String(),
        }),
        query: t.Object({
            userEmail: t.String(),
        }),
    });
