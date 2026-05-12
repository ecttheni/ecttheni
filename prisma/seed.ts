const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecttheni.com' },
    update: {},
    create: {
      email: 'admin@ecttheni.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log({ admin })

  // Seed some initial Bearers
  const bearers = [
    { name: 'Er. K. Ramesh', designation: 'தலைவர்', appointedPosition: 'President', isStateLevel: false, order: 1 },
    { name: 'Er. S. Murugan', designation: 'செயலாளர்', appointedPosition: 'Secretary', isStateLevel: false, order: 2 },
    { name: 'Er. M. Prabhu', designation: 'பொருளாளர்', appointedPosition: 'Treasurer', isStateLevel: false, order: 3 },
  ]

  for (const b of bearers) {
    await prisma.bearer.create({
      data: {
        name: b.name,
        designation: b.designation,
        briefInfo: b.appointedPosition,
        isStateLevel: b.isStateLevel,
        order: b.order,
      }
    })
  }

  // Seed Page Content
  await prisma.pageContent.upsert({
    where: { key: 'president_message' },
    update: {},
    create: {
      key: 'president_message',
      content: 'Welcome to ECT Theni Center. We are building a stronger community of civil engineers.',
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
