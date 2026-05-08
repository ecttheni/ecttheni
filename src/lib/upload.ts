import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFile(file: any, folder: string, maxSize?: number): Promise<string | null> {
  if (!file || !(file instanceof Blob) || file.size === 0) return null;

  const limit = maxSize ?? DEFAULT_MAX_SIZE;
  if (file.size > limit) {
    const limitMb = limit / (1024 * 1024);
    console.error(`Upload rejected: File size exceeds ${limitMb}MB limit`);
    return null;
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error(`Upload rejected: Invalid file type "${file.type}"`);
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = ((file as any).name?.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      console.error(`Upload rejected: Invalid extension ".${extension}"`);
      return null;
    }

    const filename = `${uuidv4()}.${extension}`;
    
    const path = join(process.cwd(), "public", "contents", folder, filename);
    const publicUrl = `/contents/${folder}/${filename}`;

    await writeFile(path, buffer);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
