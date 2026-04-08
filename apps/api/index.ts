import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { budgetRoute } from "./src/routes/budget";
import { budgetFeaturesRoute } from "./src/routes/budget-features";
import { aiServiceRoute } from "./src/routes/ai-service";

const app = new Elysia()
    .use(swagger()) // Register the Swagger plugin
    .use(budgetRoute)
    .use(budgetFeaturesRoute)
    .use(aiServiceRoute)
    .get('/health', () => ({ status: 'OK', uptime: process.uptime() }))
    .get("/", () => "Hello budget app API!")

    .listen(3001)

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);


