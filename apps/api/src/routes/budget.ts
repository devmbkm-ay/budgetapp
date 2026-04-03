import { Elysia, t } from "elysia";

export const budgetRoute = new Elysia()
    .get("/budget", () => {
        return [
            { id: 1, label: "Courses", amount: 150, currency: "EUR" },
            { id: 2, label: "Books", amount: 50, currency: "EUR" },
            { id: 3, label: "Software", amount: 100, currency: "EUR" }
        ]
    })
    .post("/transaction", ({ body }) => {
        return {
            message: "Transaction ajoutée",
            data: body
        }
    }, {
        body: t.Object({
            label: t.String(),
            amount: t.Number(),
            currency: t.String(),
            category: t.Optional(t.String())
        })
    })