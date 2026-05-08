import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to create a test bearer...");
    const bearer = await prisma.bearer.create({
      data: {
        name: "Test Bearer",
        designation: "Tester",
        mobile: "1234567890",
        company: "Test Co",
        order: 99,
      }
    });
    console.log("Success! Created bearer:", bearer);
    
    // Clean up
    await prisma.bearer.delete({ where: { id: bearer.id } });
    console.log("Cleaned up test bearer.");
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
