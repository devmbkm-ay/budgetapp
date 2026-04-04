import { Elysia, t } from "elysia";
import { createTransaction, listTransactions } from "../../../../packages/database/index.ts";

export const budgetRoute = new Elysia()
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    .options("/transactions", ({ set }) => {
        set.status = 204;
        return "";
    })
    .get("/budget", async () => {
        return listTransactions();
    })
    .get("/transactions", async () => {
        return listTransactions();
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
    });
