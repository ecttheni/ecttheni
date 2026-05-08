import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string | null> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `ecttheni/${folder}`, resource_type: "image" },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error)
            resolve(null)
          } else {
            resolve(result.secure_url)
          }
        }
      )
      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return null
  }
}

export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    const segments = url.split("/")
    const publicIdWithExt = segments[segments.length - 1]
    const publicIdParts = publicIdWithExt.split(".")
    const publicId = publicIdParts.slice(0, -1).join(".")

    const folderMatch = url.match(/\/ecttheni\/([^/]+)\//)
    if (!folderMatch) return false

    const fullPublicId = `ecttheni/${folderMatch[1]}/${publicId}`
    const result = await cloudinary.uploader.destroy(fullPublicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return false
  }
}
