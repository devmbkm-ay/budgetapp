import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});



async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    if (transactions.length === 0) {
      console.log('--- Aucune transaction trouvée ---')
      console.log('Utilisez bun prisma/seed.ts pour ajouter des données de test.')
    } else {
      console.log('--- Liste des Transactions (Source: /projects/budgetapp) ---')
      console.table(transactions.map(t => ({
        ID: t.id.substring(0, 8),
        Label: t.label,
        Montant: `${t.amount} ${t.currency}`,
        Catégorie: t.category,
        Utilisateur: t.user.name || t.user.email
      })))
    }
  } catch (error) {
    console.error('Erreur lors de la récupération :', error)
  } finally {
    await prisma.$disconnect()
  }
}

getTransactions()
