import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

let client: PrismaClient

function getClient(): PrismaClient {
  if (!client) {
    const dbUrl = new URL(process.env.DATABASE_URL!)
    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306'),
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.substring(1),
    })
    client = new PrismaClient({ adapter })
  }
  return client
}

const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})

export { prisma }
export default prisma
