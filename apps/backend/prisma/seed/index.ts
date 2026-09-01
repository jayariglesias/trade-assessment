import 'dotenv/config';

import { createPrismaClient } from '../../src/infrastructure/database/create-prisma-client';
import { seedTrades } from './seeders/trades';

const databaseUrl = process.env.DATABASE_URL ?? 'file:./db.sqlite';
const prisma = createPrismaClient(databaseUrl);

async function main() {
  await seedTrades(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
