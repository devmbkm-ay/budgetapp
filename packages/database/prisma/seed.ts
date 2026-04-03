import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = [
        {
            name: "Ricardo",
            email: "ricardo@test.com",
            transactions: [
                { label: "Salaire", amount: 2500.00, category: "Revenu", date: new Date("2026-04-01") },
                { label: "Loyer", amount: -850.00, category: "Logement", date: new Date("2026-04-02") },
                { label: "Courses Leclerc", amount: -65.20, category: "Alimentation", date: new Date("2026-04-03") },
            ]
        },
        {
            name: "Sophie",
            email: "sophie@test.com",
            transactions: [
                { label: "Honoraires", amount: 3200.00, category: "Revenu", date: new Date("2026-04-01") },
                { label: "Co-working", amount: -250.00, category: "Professionnel", date: new Date("2026-04-05") },
                { label: "Abonnement Gym", amount: -39.90, category: "Santé", date: new Date("2026-04-06") },
            ]
        },
        {
            name: "Thomas",
            email: "thomas@test.com",
            transactions: [
                { label: "Salaire Alternance", amount: 1100.00, category: "Revenu", date: new Date("2026-04-01") },
                { label: "McDo", amount: -12.50, category: "Alimentation", date: new Date("2026-04-02") },
                { label: "Jeux Vidéo", amount: -59.99, category: "Loisirs", date: new Date("2026-04-03") },
            ]
        }
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                transactions: {
                    create: u.transactions,
                },
            },
        });
    }

    console.log('✅ Base de données peuplée avec 3 utilisateurs via l\'adapter PostgreSQL !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
