import { existsSync, readFileSync } from "node:fs";
import { createConnection } from "node:net";
import { resolve } from "node:path";

const rootDir = import.meta.dir ? resolve(import.meta.dir, "..") : process.cwd();
const envPath = resolve(rootDir, "packages/database/.env");

function loadDatabaseUrl() {
  if (!existsSync(envPath)) {
    return null;
  }

  const file = readFileSync(envPath, "utf8");

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key === "DATABASE_URL" && value) {
      return value;
    }
  }

  return null;
}

async function checkDatabaseConnection(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = Number(url.port || "5432");

    await new Promise<void>((resolvePromise, rejectPromise) => {
      const socket = createConnection({ host, port });

      socket.once("connect", () => {
        socket.end();
        resolvePromise();
      });

      socket.once("error", (error) => {
        socket.destroy();
        rejectPromise(error);
      });

      socket.setTimeout(1500, () => {
        socket.destroy();
        rejectPromise(new Error("timeout"));
      });
    });

    return { ok: true as const, host, port };
  } catch {
    return { ok: false as const };
  }
}

async function main() {
  const databaseUrl = loadDatabaseUrl();

  console.log("");
  console.log("BudgetApp dev launcher");
  console.log("----------------------");
  console.log("Web: http://localhost:3030");
  console.log("API: http://localhost:3001");
  console.log("Health: http://localhost:3001/health");

  if (!databaseUrl) {
    console.log("");
    console.log("Warning: packages/database/.env is missing or DATABASE_URL is not set.");
  } else {
    const databaseCheck = await checkDatabaseConnection(databaseUrl);

    console.log("");
    if (databaseCheck.ok) {
      console.log(`Database: reachable at ${databaseCheck.host}:${databaseCheck.port}`);
    } else {
      console.log("Warning: database is not reachable right now. The apps will still start.");
    }
  }

  console.log("");
  console.log("Starting web + api...");
  console.log("");

  const child = Bun.spawn(["bun", "run", "dev:app"], {
    cwd: rootDir,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await child.exited;
  process.exit(exitCode);
}

await main();
