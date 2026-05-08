import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking if there are any members...");
    const user = await prisma.user.findFirst({
      include: { memberDetails: true }
    });
    
    if (!user || !user.memberDetails) {
      console.log("No user with member details found. Can't test project creation directly.");
      return;
    }

    console.log("Creating a test project for user:", user.email);
    const projectId = uuidv4();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        memberDetailId: user.memberDetails.id,
        name: "Test Project",
        description: "Testing",
        photoUrl: "",
      }
    });

    console.log("Success! Project created:", project);
    await prisma.project.delete({ where: { id: project.id } });
    console.log("Cleaned up test project.");
  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
