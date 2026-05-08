import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import dotenv from 'dotenv'

dotenv.config()

const prismaClientSingleton = () => {
  const dbUrl = new URL(process.env.DATABASE_URL!)
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306'),
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.substring(1),
  })

  return new PrismaClient({ adapter })
}

const prisma = prismaClientSingleton()

async function main() {
  try {
    console.log("Attempting to create a test bearer with adapter...");
    const bearer = await prisma.bearer.create({
      data: {
        name: "Adapter Test",
        designation: "Tester",
        mobile: "12345",
        company: "Test",
        order: 1
      }
    });
    console.log("Success! ID:", bearer.id);
    await prisma.bearer.delete({ where: { id: bearer.id } });
  } catch (error) {
    console.error("Adapter Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
