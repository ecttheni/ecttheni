"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  return null;
}

export async function getAdmins() {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: admins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { success: false, error: "Failed to fetch admins" };
  }
}

export async function createAdmin(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Valid email is required" };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  try {
    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "An admin with this email already exists" };
    }
    console.error("Error creating admin:", error);
    return { success: false, error: "Failed to create admin" };
  }
}

export async function updateAdmin(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.id === id) {
    return { success: false, error: "You cannot edit your own account here" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const status = formData.get("status") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Valid email is required" };
  }

  try {
    const data: any = { email };
    if (status === "ACTIVE" || status === "INACTIVE") {
      data.status = status;
    }
    if (password && password.length >= 8) {
      data.password = await hash(password, 12);
    }

    await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "An admin with this email already exists" };
    }
    console.error("Error updating admin:", error);
    return { success: false, error: "Failed to update admin" };
  }
}

export async function deleteAdmin(id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.id === id) {
    return { success: false, error: "You cannot delete your own account" };
  }

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { success: false, error: "Failed to delete admin" };
  }
}
