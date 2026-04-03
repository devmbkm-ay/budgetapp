import { Elysia } from "elysia";

const app = new Elysia()
    .get("/", () => "Hello budget app API!")
    .listen(3001)

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);


