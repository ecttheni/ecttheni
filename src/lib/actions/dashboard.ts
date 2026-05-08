"use server";

import prisma from "@/lib/prisma";
import { Role, InquiryStatus } from "@prisma/client";

export async function getDashboardStats() {
  try {
    const [totalMembers, totalBearers, upcomingEvents, newContactInquiries, newRegistrationInquiries] = await Promise.all([
      prisma.user.count({ where: { role: Role.MEMBER } }),
      prisma.bearer.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.contactInquiry.count({ where: { status: InquiryStatus.NEW } }),
      prisma.registrationInquiry.count({ where: { status: InquiryStatus.NEW } }),
    ]);

    return {
      success: true,
      data: {
        totalMembers,
        totalBearers,
        upcomingEvents,
        newApplications: newContactInquiries + newRegistrationInquiries,
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

export async function getRecentActivity() {
  try {
    const [recentMembers, recentInquiries, recentRegistrations, recentBookings] = await Promise.all([
      prisma.user.findMany({
        where: { role: Role.MEMBER },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { memberDetails: { select: { fullName: true } } },
      }),
      prisma.contactInquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.registrationInquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.eventBooking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { include: { memberDetails: { select: { fullName: true } } } },
          event: { select: { title: true } },
        },
      }),
    ])

    const activities: {
      id: string
      type: "member" | "inquiry" | "registration" | "booking"
      description: string
      timestamp: Date
    }[] = []

    recentMembers.forEach((m) =>
      activities.push({
        id: `member-${m.id}`,
        type: "member",
        description: `${m.memberDetails?.fullName || m.email} joined as a new member`,
        timestamp: m.createdAt,
      })
    )

    recentInquiries.forEach((i) =>
      activities.push({
        id: `inquiry-${i.id}`,
        type: "inquiry",
        description: `${i.name} sent a contact inquiry`,
        timestamp: i.createdAt,
      })
    )

    recentRegistrations.forEach((r) =>
      activities.push({
        id: `registration-${r.id}`,
        type: "registration",
        description: `${r.fullName} applied for registration (${r.company})`,
        timestamp: r.createdAt,
      })
    )

    recentBookings.forEach((b) =>
      activities.push({
        id: `booking-${b.id}`,
        type: "booking",
        description: `${b.user.memberDetails?.fullName || b.user.email} booked for ${b.event.title}`,
        timestamp: b.createdAt,
      })
    )

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return { success: true, data: activities.slice(0, 10) }
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return { success: false, error: "Failed to fetch recent activity" }
  }
}
