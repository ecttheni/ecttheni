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

export async function getBearers() {
  try {
    const bearers = await prisma.bearer.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return { success: true, data: bearers };
  } catch (error) {
    console.error("Error fetching bearers:", error);
    return { success: false, error: "Failed to fetch bearers" };
  }
}

export async function createBearer(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const name = formData.get("name") as string;
  const designation = formData.get("designation") as string;
  const isStateLevel = formData.get("isStateLevel") === "true";
  const order = parseInt(formData.get("order") as string || "0");
  const mobile = formData.get("mobile") as string || null;
  const company = formData.get("company") as string || null;
  const photoFile = formData.get("photo") as File | null;
  const briefInfo = formData.get("briefInfo") as string || null;
  
  let photoUrl = formData.get("photoUrl") as string || null;

  const nameError = validateString(name, "Name");
  if (nameError) return { success: false, error: nameError };

  const designationError = validateString(designation, "Designation");
  if (designationError) return { success: false, error: designationError };

  if (photoFile && photoFile.size > 0) {
    const uploadedUrl = await uploadFile(photoFile, "bearers");
    if (uploadedUrl) photoUrl = uploadedUrl;
  }

  try {
    const bearerId = uuidv4();

    const bearer = await prisma.bearer.create({
      data: {
        id: bearerId,
        name,
        designation,
        isStateLevel,
        order,
        photoUrl,
        briefInfo,
        mobile,
        company,
      },
    });

    try {
      revalidatePath("/bearers");
      revalidatePath("/admin/bearers");
    } catch (e) {
      console.warn("Revalidation failed, but bearer was created:", e);
    }
    
    return { success: true, data: bearer };
  } catch (error: any) {
    console.error("CRITICAL ERROR in createBearer:", error);
    return { 
      success: false, 
      error: `Database Error: ${error?.message || "Unknown error"}. Check if all fields are filled correctly.`
    };
  }
}

export async function updateBearer(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const name = formData.get("name") as string;
  const designation = formData.get("designation") as string;
  const isStateLevel = formData.get("isStateLevel") === "true";
  const order = parseInt(formData.get("order") as string || "0");
  const mobile = formData.get("mobile") as string || null;
  const company = formData.get("company") as string || null;
  const photoFile = formData.get("photo") as File | null;
  const briefInfo = formData.get("briefInfo") as string || null;
  
  let photoUrl = formData.get("photoUrl") as string || null;

  const nameError = validateString(name, "Name");
  if (nameError) return { success: false, error: nameError };

  const designationError = validateString(designation, "Designation");
  if (designationError) return { success: false, error: designationError };

  if (photoFile && photoFile.size > 0) {
    const uploadedUrl = await uploadFile(photoFile, "bearers");
    if (uploadedUrl) photoUrl = uploadedUrl;
  }

  try {
    const bearer = await prisma.bearer.update({
      where: { id },
      data: {
        name,
        designation,
        isStateLevel,
        order,
        photoUrl,
        briefInfo,
        mobile,
        company,
      },
    });

    try {
      revalidatePath("/bearers");
      revalidatePath("/admin/bearers");
    } catch (e) {
      console.warn("Revalidation failed, but bearer was updated:", e);
    }
    
    return { success: true, data: bearer };
  } catch (error: any) {
    console.error("CRITICAL ERROR in updateBearer:", error);
    return { 
      success: false, 
      error: `Database Error: ${error?.message || "Unknown error"}. Check if all fields are filled correctly.`
    };
  }
}

export async function deleteBearer(id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    await prisma.bearer.delete({
      where: { id },
    });
    revalidatePath("/bearers");
    revalidatePath("/admin/bearers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting bearer:", error);
    return { success: false, error: "Failed to delete bearer" };
  }
}
