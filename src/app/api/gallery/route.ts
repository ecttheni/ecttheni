import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const grouped = searchParams.get("grouped") === "true";

    if (grouped) {
      const items = await prisma.homeGallery.findMany({
        include: { event: { select: { id: true, title: true, imageUrl: true } } },
        orderBy: { createdAt: "desc" },
      });

      const eventGroups = new Map<string, { type: "event"; id: string; title: string; thumbnail: string | null; photos: any[] }>();
      const captionGroups = new Map<string, { type: "caption" | "uncategorized"; id: string; title: string; thumbnail: string | null; photos: any[] }>();

      for (const item of items) {
        if (item.eventId && item.event) {
          const key = item.eventId;
          if (!eventGroups.has(key)) {
            eventGroups.set(key, {
              type: "event", id: `event_${key}`,
              title: item.event.title,
              thumbnail: item.event.imageUrl || item.imageUrl,
              photos: [],
            });
          }
          eventGroups.get(key)!.photos.push(item);
        } else if (item.caption) {
          const key = item.caption;
          if (!captionGroups.has(key)) {
            captionGroups.set(key, {
              type: "caption", id: `caption_${key}`,
              title: item.caption,
              thumbnail: item.imageUrl,
              photos: [],
            });
          }
          captionGroups.get(key)!.photos.push(item);
        } else {
          const key = "__uncategorized__";
          if (!captionGroups.has(key)) {
            captionGroups.set(key, {
              type: "uncategorized", id: key,
              title: "Uncategorized",
              thumbnail: item.imageUrl,
              photos: [],
            });
          }
          captionGroups.get(key)!.photos.push(item);
        }
      }

      function firstAlbumUrl(photos: any[]): string | null {
        for (const p of photos) {
          if (p.googleAlbumUrl) return p.googleAlbumUrl;
        }
        return null;
      }

      const groups = [
        ...Array.from(eventGroups.values()).map((g) => ({ ...g, googleAlbumUrl: firstAlbumUrl(g.photos) })),
        ...Array.from(captionGroups.values()).map((g) => ({ ...g, googleAlbumUrl: firstAlbumUrl(g.photos) })),
      ];

      return NextResponse.json({ groups });
    }

    if (eventId) {
      const gallery = await prisma.homeGallery.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(gallery);
    }

    const gallery = await prisma.homeGallery.findMany({
      include: { event: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const eventId = formData.get("eventId") as string | null;
    const googleAlbumUrl = formData.get("googleAlbumUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ONE_MB = 1 * 1024 * 1024;
    const imageUrl = await uploadFile(file, "gallery", ONE_MB);
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Upload failed. File must be an image under 1MB (jpg, png, webp, gif)." },
        { status: 400 }
      );
    }

    const item = await prisma.homeGallery.create({
      data: { imageUrl, caption, eventId: eventId || null, googleAlbumUrl: googleAlbumUrl || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await prisma.homeGallery.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
