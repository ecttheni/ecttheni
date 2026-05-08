"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  return null;
}

function validateString(value: string | null, field: string, min: number = 1, max: number = 255): string | null {
  if (!value || value.trim().length < min) return `${field} is required`;
  if (value.length > max) return `${field} must be less than ${max} characters`;
  return null;
}

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function createEvent(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string || "";
  const photoFile = formData.get("photo") as File | null;
  let imageUrl = formData.get("imageUrl") as string || "";

  const titleError = validateString(title, "Title");
  if (titleError) return { success: false, error: titleError };

  if (!dateStr || isNaN(Date.parse(dateStr))) {
    return { success: false, error: "Valid date is required" };
  }

  try {
    if (photoFile && photoFile.size > 0) {
      const uploadedUrl = await uploadFile(photoFile, "events");
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const eventId = uuidv4();

    const event = await prisma.event.create({
      data: {
        id: eventId,
        title,
        location,
        date: new Date(dateStr),
        description,
        imageUrl,
      } as any,
    });

    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/admin/events");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function deleteEvent(id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    await prisma.event.delete({
      where: { id },
    });
    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string || "";
  const photoFile = formData.get("photo") as File | null;
  let imageUrl = formData.get("imageUrl") as string || "";

  const titleError = validateString(title, "Title");
  if (titleError) return { success: false, error: titleError };

  if (!dateStr || isNaN(Date.parse(dateStr))) {
    return { success: false, error: "Valid date is required" };
  }

  try {
    if (photoFile && photoFile.size > 0) {
      const uploadedUrl = await uploadFile(photoFile, "events");
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        location,
        date: new Date(dateStr),
        description,
        imageUrl,
      } as any,
    });

    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/admin/events");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: {
              include: {
                memberDetails: true
              }
            }
          }
        }
      }
    });
    if (!event) return { success: false, error: "Event not found" };
    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

export async function bookEvent(eventId: string, userId: string) {
  try {
    const existing = await prisma.eventBooking.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existing) {
      await prisma.eventBooking.delete({
        where: { id: existing.id }
      });
      revalidatePath(`/events/${eventId}`);
      return { success: true, message: "Booking cancelled", booked: false };
    }

    await prisma.eventBooking.create({
      data: {
        eventId,
        userId
      }
    });
    revalidatePath(`/events/${eventId}`);
    return { success: true, message: "Event booked successfully", booked: true };
  } catch (error) {
    console.error("Error booking event:", error);
    return { success: false, error: "Failed to book event" };
  }
}

export async function checkBooking(eventId: string, userId: string) {
  try {
    const booking = await prisma.eventBooking.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });
    return { success: true, booked: !!booking };
  } catch (error) {
    return { success: false, booked: false };
  }
}

export async function getMemberBookings(userId: string) {
  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: { event: { date: "desc" } },
    })

    return {
      success: true,
      data: bookings.map((b) => ({
        id: b.event.id,
        title: b.event.title,
        date: b.event.date,
        description: b.event.description,
        imageUrl: b.event.imageUrl,
        location: b.event.location,
        bookedAt: b.createdAt,
      })),
    }
  } catch (error) {
    console.error("Error fetching member bookings:", error)
    return { success: false, error: "Failed to fetch bookings" }
  }
}

export async function getEventBookings(eventId: string) {
  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            memberDetails: {
              select: {
                fullName: true,
                mobile: true,
                company: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: bookings.map((b) => ({
        id: b.id,
        userId: b.userId,
        email: b.user.email,
        fullName: b.user.memberDetails?.fullName || "Unknown",
        mobile: b.user.memberDetails?.mobile || null,
        company: b.user.memberDetails?.company || null,
        location: b.user.memberDetails?.location || null,
        bookedAt: b.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching event bookings:", error);
    return { success: false, error: "Failed to fetch bookings" };
  }
}
