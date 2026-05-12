import { PrismaClient } from '@prisma/client'

let client: PrismaClient

function getClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient()
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
