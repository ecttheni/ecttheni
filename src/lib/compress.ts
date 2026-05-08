export async function compressImage(file: File, maxBytes: number = 1 * 1024 * 1024): Promise<File> {
  if (file.size <= maxBytes) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIM);
          width = MAX_DIM;
        } else {
          width = Math.round((width / height) * MAX_DIM);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const tryQuality = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          if (blob.size <= maxBytes || quality <= 0.1) {
            const name = file.name.replace(/\.[^.]+$/, ".jpg").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
            resolve(new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }));
          } else {
            tryQuality(quality - 0.1);
          }
        }, "image/jpeg", quality);
      };
      tryQuality(0.8);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
