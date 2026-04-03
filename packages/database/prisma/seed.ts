import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

async function main() {
    const user = await prisma.user.upsert({
        where: { email: "ricardo@test.com" },
        update: {},
        create: {
            email: "ricardo@test.com",
            name: "Ricardo",
            transactions: {
                create: [
                    { label: "Courses", amount: -45.50, category: "Alimentation" },
                    { label: "Salaire", amount: 2500.00, category: "Revenus" },
                ],
            },
        },
    })
    console.log('✅ Données insérées avec succès !')
    console.log(user)
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed :')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
