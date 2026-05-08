"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  return null;
}

export async function getPageContent(key: string) {
  try {
    const content = await prisma.pageContent.findUnique({
      where: { key },
    });
    return { success: true, data: content };
  } catch (error) {
    console.error(`Error fetching content for ${key}:`, error);
    return { success: false, error: "Failed to fetch content" };
  }
}

export async function updatePageContent(key: string, content: string, imageUrl?: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const updated = await prisma.pageContent.upsert({
      where: { key },
      update: { content, imageUrl },
      create: { key, content, imageUrl },
    });
    
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error(`Error updating content for ${key}:`, error);
    return { success: false, error: "Failed to update content" };
  }
}
export async function getAllSettings() {
  try {
    const settings = await prisma.pageContent.findMany();
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr;
      return acc;
    }, {});
    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("Error fetching all settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function updateSiteSettings(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    const keys = [
      "state_president_name", "state_president_message",
      "president_name", "president_message",
      "secretary_name", "secretary_message",
      "site_logo", "hero_title", "hero_subtitle",
      "contact_address", "contact_phone", "contact_email",
      "social_facebook", "social_twitter", "social_instagram",
      "footer_text", "milestones"
    ];

    for (const key of keys) {
      const content = formData.get(`${key}_content`) as string;
      const file = formData.get(`${key}_file`) as File;
      const existingUrl = formData.get(`${key}_url`) as string;

      let imageUrl = existingUrl || "";
      if (file && file.size > 0) {
        const uploadedUrl = await uploadFile(file, "settings");
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      if (content !== null || imageUrl !== null) {
         await prisma.pageContent.upsert({
           where: { key },
           update: { content: content || "", imageUrl: imageUrl || "" },
           create: { key, content: content || "", imageUrl: imageUrl || "" },
         });
      }
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
