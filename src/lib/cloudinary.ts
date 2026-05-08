import { v2 as cloudinary } from "cloudinary"

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  return cloudinary
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string | null> {
  try {
    const cld = getCloudinary()
    const base64 = buffer.toString("base64")
    const dataUri = `data:image/jpeg;base64,${base64}`

    const result = await cld.uploader.upload(dataUri, {
      folder: `ecttheni/${folder}`,
    })

    return result.secure_url
  } catch (error) {
    console.error("Cloudinary upload error:", error instanceof Error ? error.message : error)
    return null
  }
}

export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    const cld = getCloudinary()
    const segments = url.split("/")
    const fullId = segments.slice(segments.indexOf("ecttheni")).join("/").replace(/\.[^.]+$/, "")
    const result = await cld.uploader.destroy(fullId)
    return result.result === "ok"
  } catch (error) {
    console.error("Cloudinary delete error:", error instanceof Error ? error.message : error)
    return false
  }
}
