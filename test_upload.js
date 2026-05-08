const { writeFile } = require('fs/promises');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

async function uploadFile(file, folder) {
  if (!file || !(file instanceof Blob) || file.size === 0) return null;

  try {
    // Simulate a file object for testing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const extension = (file.name || 'test.png').split(".").pop() || "png";
    const filename = `${uuidv4()}.${extension}`;
    
    // Path relative to the root for writing, but relative to / for the URL
    const path = join(process.cwd(), "public", "contents", folder, filename);
    const publicUrl = `/contents/${folder}/${filename}`;

    await writeFile(path, buffer);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

// Test with a fake file
const fakeFile = new File(["test"], "test.png", { type: "image/png" });

uploadFile(fakeFile, "sponsors")
  .then(url => {
    console.log("Uploaded to:", url);
    // Check if file exists
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), "public", "contents", "sponsors", url.split("/").pop());
    console.log("File exists:", fs.existsSync(filePath));
  })
  .catch(console.error);