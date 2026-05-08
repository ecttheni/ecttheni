"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getDashboardStats() {
  try {
    const [totalMembers, totalBearers, upcomingEvents] = await Promise.all([
      prisma.user.count({ where: { role: Role.MEMBER } }),
      prisma.bearer.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
    ]);

    return {
      success: true,
      data: {
        totalMembers,
        totalBearers,
        upcomingEvents,
        newApplications: 0, // Logic for applications pending if needed
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}
