import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { Orientation } from "@prisma/client";

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function maxUploadSize() {
  return Number(process.env.MAX_UPLOAD_SIZE ?? 20 * 1024 * 1024);
}

export function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export async function savePosterImage(file: File) {
  if (!allowedMime.has(file.type)) throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  if (file.size > maxUploadSize()) throw new Error("Image exceeds the maximum upload size.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Invalid image file.");

  const ext = extensionByMime[file.type];
  const baseName = `${Date.now()}-${randomUUID()}`;
  const dir = uploadRoot();
  await mkdir(dir, { recursive: true });

  const originalName = `${baseName}.${ext}`;
  const thumbName = `${baseName}-thumb.webp`;
  await writeFile(path.join(dir, originalName), bytes);
  await sharp(bytes)
    .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(dir, thumbName));

  return {
    imageUrl: `/uploads/${originalName}`,
    thumbnailUrl: `/uploads/${thumbName}`,
    orientation: detectOrientation(metadata.width, metadata.height)
  };
}

function detectOrientation(width: number, height: number): Orientation {
  if (width === height) return "SQUARE";
  return width > height ? "LANDSCAPE" : "PORTRAIT";
}
