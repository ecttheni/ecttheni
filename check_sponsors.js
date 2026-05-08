const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

const dbUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '3306'),
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.substring(1),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const sponsors = await prisma.sponsor.findMany();
  console.log('Found', sponsors.length, 'sponsors:');
  sponsors.forEach((s, i) => {
    console.log((i+1) + '. ' + s.name + ' - logoUrl: ' + (s.logoUrl || 'NULL'));
  });
  await prisma.$disconnect();
}

main().catch(console.error);