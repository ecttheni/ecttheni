"use server";

import prisma from "@/lib/prisma";
import { Role, Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { uploadFile } from "@/lib/upload";
import { generateSlug } from "@/lib/slug";
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

function generateRandomPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateString(value: string | null, field: string, min: number = 1, max: number = 255): string | null {
  if (!value || value.length < min) return `${field} is required`;
  if (value.length > max) return `${field} must be less than ${max} characters`;
  return null;
}

async function ensureUniqueSlug(name: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(name);
  let exists = await prisma.user.findUnique({ where: { slug } });
  let counter = 1;
  while (exists && exists.id !== excludeId) {
    slug = `${generateSlug(name)}-${counter}`;
    exists = await prisma.user.findUnique({ where: { slug } });
    counter++;
  }
  return slug;
}

export async function getMembers() {
  try {
    const members = await prisma.user.findMany({
      where: { role: Role.MEMBER },
      include: { memberDetails: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: members };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

export async function getMemberBySlug(slug: string) {
  try {
    const member = await prisma.user.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
      include: {
        memberDetails: {
          include: {
            projects: true,
            gallery: true,
          },
        },
      },
    });
    return { success: true, data: member };
  } catch (error) {
    console.error("Error fetching member:", error);
    return { success: false, error: "Failed to fetch member" };
  }
}

export async function getMemberById(id: string) {
  try {
    const member = await prisma.user.findUnique({
      where: { id },
      include: {
        memberDetails: {
          include: {
            projects: true,
            gallery: true,
          },
        },
      },
    });
    return { success: true, data: member };
  } catch (error) {
    console.error("Error fetching member:", error);
    return { success: false, error: "Failed to fetch member" };
  }
}

export async function createMember(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;
  const designation = formData.get("designation") as string;
  const entryYear = parseInt(formData.get("entryYear") as string);

  const nameError = validateString(fullName, "Full name");
  if (nameError) return { success: false, error: nameError };

  if (!email || !validateEmail(email)) return { success: false, error: "Valid email is required" };

  const designationError = validateString(designation, "Designation");
  if (designationError) return { success: false, error: designationError };

  if (isNaN(entryYear) || entryYear < 1900 || entryYear > new Date().getFullYear() + 1) {
    return { success: false, error: "Valid entry year is required" };
  }

  const randomPassword = generateRandomPassword();
  const hashedPassword = await hash(randomPassword, 12);

  try {
    const userId = uuidv4();
    const detailId = uuidv4();
    const slug = await ensureUniqueSlug(fullName);

    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        role: Role.MEMBER,
        status: Status.ACTIVE,
        entryYear,
        slug,
        memberDetails: {
          create: {
            id: detailId,
            fullName,
            company,
            designation,
          },
        },
      },
    });

    revalidatePath("/admin/members");
    revalidatePath("/members");
    return { success: true, data: user, temporaryPassword: randomPassword };
  } catch (error: any) {
    console.error("Error creating member:", error);
    if (error.code === "P2002") {
      return { success: false, error: "A member with this email already exists." };
    }
    return { success: false, error: "Failed to create member. Please try again." };
  }
}

export async function deleteMember(id: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/members");
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: "Failed to delete member" };
  }
}

export async function updateMemberProfile(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.id !== id) {
    return { success: false, error: "Unauthorized" };
  }

  const fullName = formData.get("fullName") as string;
  const company = formData.get("company") as string;
  const companyAddress = formData.get("companyAddress") as string;
  const mobile = formData.get("mobile") as string;
  const dateOfBirthStr = formData.get("dateOfBirth") as string;
  const dateOfAnniversaryStr = formData.get("dateOfAnniversary") as string;
  const aboutUs = formData.get("aboutUs") as string;
  const designation = formData.get("designation") as string;
  const location = formData.get("location") as string;
  const experience = formData.get("experience") as string;
  const skills = formData.get("skills") as string;
  const workingPlaces = formData.get("workingPlaces") as string;
  const additionalBusiness = formData.get("additionalBusiness") as string;
  const requirements = formData.get("requirements") as string;
  const instagramUrl = formData.get("instagramUrl") as string;
  const facebookUrl = formData.get("facebookUrl") as string;
  const photoFile = formData.get("photo") as File | null;
  let photoUrl = formData.get("photoUrl") as string;

  const nameError = validateString(fullName, "Full name");
  if (nameError) return { success: false, error: nameError };

  const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;
  const dateOfAnniversary = dateOfAnniversaryStr ? new Date(dateOfAnniversaryStr) : null;

  try {
    if (photoFile && photoFile.size > 0) {
      const uploadedUrl = await uploadFile(photoFile, "members");
      if (uploadedUrl) photoUrl = uploadedUrl;
    }

    const existing = await prisma.memberDetail.findUnique({
      where: { userId: id },
      select: { fullName: true },
    });

    if (existing && existing.fullName !== fullName) {
      const slug = await ensureUniqueSlug(fullName, id);
      await prisma.user.update({
        where: { id },
        data: { slug },
      });
    }

    await prisma.memberDetail.update({
      where: { userId: id },
      data: {
        fullName,
        company,
        companyAddress,
        mobile,
        dateOfBirth,
        dateOfAnniversary,
        aboutUs,
        designation,
        location,
        experience,
        skills,
        workingPlaces,
        additionalBusiness,
        requirements,
        instagramUrl,
        facebookUrl,
        photoUrl,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    console.error("Error updating member profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.id !== id) {
    return { success: false, error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

export async function addProject(memberDetailId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const member = await prisma.memberDetail.findUnique({
    where: { id: memberDetailId },
    select: { userId: true },
  });
  if (!member || member.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const photoFile = formData.get("photo") as File | null;
  let photoUrl = "";

  const nameError = validateString(name, "Project name");
  if (nameError) return { success: false, error: nameError };

  try {
    if (photoFile && photoFile.size > 0) {
      const uploadedUrl = await uploadFile(photoFile, "gallery");
      if (uploadedUrl) photoUrl = uploadedUrl;
    }
    const projectId = uuidv4();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        memberDetailId,
        name,
        description,
        photoUrl,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: project };
  } catch (error: any) {
    console.error("CRITICAL Error adding project:", error);
    return { success: false, error: `Database Error: ${error?.message || "Unknown error"}.` };
  }
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { memberDetail: { select: { userId: true } } },
    });
    if (!project || project.memberDetail.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.project.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function addGalleryItem(memberDetailId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const member = await prisma.memberDetail.findUnique({
    where: { id: memberDetailId },
    select: { userId: true },
  });
  if (!member || member.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const photoFile = formData.get("photo") as File | null;

  try {
    let imageUrl = "";
    if (photoFile && photoFile.size > 0) {
      const uploadedUrl = await uploadFile(photoFile, "gallery");
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (!imageUrl) return { success: false, error: "No photo uploaded" };
    const galleryId = uuidv4();
    const item = await prisma.memberGallery.create({
      data: {
        id: galleryId,
        memberDetailId,
        imageUrl,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("CRITICAL Error adding gallery item:", error);
    return { success: false, error: `Database Error: ${error?.message || "Unknown error"}.` };
  }
}

export async function deleteGalleryItem(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const item = await prisma.memberGallery.findUnique({
      where: { id },
      include: { memberDetail: { select: { userId: true } } },
    });
    if (!item || item.memberDetail.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.memberGallery.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}
