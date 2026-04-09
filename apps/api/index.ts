import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load .env from the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../../");
config({ path: resolve(rootDir, ".env") });

import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { budgetRoute } from "./src/routes/budget";
import { budgetFeaturesRoute } from "./src/routes/budget-features";
import { aiServiceRoute } from "./src/routes/ai-service";
import { investmentRoutes } from "./src/routes/investment";

const app = new Elysia()
    .use(swagger()) // Register the Swagger plugin
    .use(budgetRoute)
    .use(budgetFeaturesRoute)
    .use(aiServiceRoute)
    .use(investmentRoutes)
    .get('/health', () => ({ status: 'OK', uptime: process.uptime() }))
    .get("/", () => "Hello budget app API!")

    .listen(3001)

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);


