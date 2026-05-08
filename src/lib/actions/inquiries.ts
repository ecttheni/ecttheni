"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  return null;
}

export async function submitContactInquiry(data: { name: string; email: string; phone?: string; subject?: string; message?: string }) {
  try {
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, error: "Name and email are required" };
    }

    await prisma.contactInquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message?.trim() || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact inquiry:", error);
    return { success: false, error: "Failed to submit inquiry" };
  }
}

export async function submitRegistrationInquiry(data: { fullName: string; email: string; company: string; designation: string; phone?: string; experience?: string }) {
  try {
    if (!data.fullName.trim() || !data.email.trim() || !data.company.trim() || !data.designation.trim()) {
      return { success: false, error: "Full name, email, company, and designation are required" };
    }

    await prisma.registrationInquiry.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        company: data.company.trim(),
        designation: data.designation.trim(),
        phone: data.phone?.trim() || null,
        experience: data.experience?.trim() || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting registration inquiry:", error);
    return { success: false, error: "Failed to submit application" };
  }
}

export async function getContactInquiries(status?: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const where = status && status !== "ALL" ? { status: status as any } : {};
    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: inquiries };
  } catch (error) {
    console.error("Error fetching contact inquiries:", error);
    return { success: false, error: "Failed to fetch inquiries" };
  }
}

export async function getRegistrationInquiries(status?: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const where = status && status !== "ALL" ? { status: status as any } : {};
    const inquiries = await prisma.registrationInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: inquiries };
  } catch (error) {
    console.error("Error fetching registration inquiries:", error);
    return { success: false, error: "Failed to fetch inquiries" };
  }
}

export async function updateInquiryStatus(type: "contact" | "registration", id: string, status: string, notes?: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    if (type === "contact") {
      await prisma.contactInquiry.update({
        where: { id },
        data: { status: status as any, notes: notes?.trim() || null },
      });
    } else {
      await prisma.registrationInquiry.update({
        where: { id },
        data: { status: status as any, notes: notes?.trim() || null },
      });
    }

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteInquiry(type: "contact" | "registration", id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    if (type === "contact") {
      await prisma.contactInquiry.delete({ where: { id } });
    } else {
      await prisma.registrationInquiry.delete({ where: { id } });
    }

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return { success: false, error: "Failed to delete inquiry" };
  }
}

export async function getInquiryStats() {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const contactStats = await prisma.contactInquiry.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const regStats = await prisma.registrationInquiry.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return { success: true, data: { contactStats, regStats } };
  } catch (error) {
    console.error("Error fetching inquiry stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
