import { Elysia, t } from "elysia";

export const aiServiceRoute = new Elysia({ prefix: "/ai" })
    .onAfterHandle(({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "*";
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    })
    .post("/analyze-trends", async ({ body }) => {
        // Logique de cerveau IA à implémenter
        return {
            summary: "Analyse en cours...",
            insights: [
                "Vos dépenses en alimentation ont augmenté de 10%.",
                "Vous pourriez économiser 50€ sur vos abonnements."
            ]
        };
    }, {
        body: t.Object({
            userEmail: t.String(),
            period: t.Optional(t.String())
        })
    })
    .post("/scan-receipt", async ({ body }) => {
        // Simulation Vision/OCR
        return {
            merchant: "Carrefour",
            amount: 42.50,
            category: "Alimentation",
            confidence: 0.95
        };
    }, {
        body: t.Object({
            image: t.String() // Base64
        })
    });
