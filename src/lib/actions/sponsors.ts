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

export async function getSponsors() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return { success: true, data: sponsors };
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return { success: false, error: "Failed to fetch sponsors" };
  }
}

export async function createSponsor(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  
  const logoFile = formData.get("logo") as File | null;
  let logoUrl = formData.get("logoUrl") as string || "";

  const nameError = validateString(name, "Name");
  if (nameError) return { success: false, error: nameError };

  try {
    if (logoFile && logoFile.size > 0) {
      const uploadedUrl = await uploadFile(logoFile, "sponsors");
      if (uploadedUrl) logoUrl = uploadedUrl;
    }

    const sponsorId = uuidv4();

    const sponsor = await prisma.sponsor.create({
      data: {
        id: sponsorId,
        name,
        description,
        websiteUrl,
        order,
        logoUrl,
      },
    });

    revalidatePath("/sponsors");
    revalidatePath("/");
    revalidatePath("/admin/sponsors");
    return { success: true, data: sponsor };
  } catch (error) {
    console.error("Error creating sponsor:", error);
    return { success: false, error: "Failed to create sponsor" };
  }
}

export async function updateSponsor(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  
  const logoFile = formData.get("logo") as File | null;

  const nameError = validateString(name, "Name");
  if (nameError) return { success: false, error: nameError };
  
  try {
    const updateData: any = {
      name,
      description,
      websiteUrl,
      order,
     };
     
     if (logoFile && logoFile.size > 0) {
       const uploadedUrl = await uploadFile(logoFile, "sponsors");
       if (uploadedUrl) {
         updateData.logoUrl = uploadedUrl;
       }
     }
     
     const sponsor = await prisma.sponsor.update({
       where: { id },
       data: updateData,
     });
     
     revalidatePath("/sponsors");
     revalidatePath("/");
     revalidatePath("/admin/sponsors");
     return { success: true, data: sponsor };
   } catch (error) {
     console.error("Error updating sponsor:", error);
     return { success: false, error: "Failed to update sponsor" };
   }
 }

export async function deleteSponsor(id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    await prisma.sponsor.delete({
      where: { id },
    });
    revalidatePath("/sponsors");
    revalidatePath("/");
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sponsor:", error);
    return { success: false, error: "Failed to delete sponsor" };
  }
}
