import { randomUUID } from "crypto";
import { supabaseAdmin, supabaseStorageBucket } from "./supabaseAdmin";
import sharp from "sharp";

function makeSafeFileName(originalName: string) {
  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

  return `${Date.now()}-${randomUUID()}-${safeName}`;
}

export async function uploadGardenPhoto(params: {
  file: File;
  plantId: number;
  noteId: number;
}) {
  const { file, plantId, noteId } = params;

  const fileName = makeSafeFileName(file.name || "photo.jpg");
  const filePath = `plants/${plantId}/notes/${noteId}/${fileName}`;

  const thumbnailFileName = `thumb-${fileName}.jpg`;
  const thumbnailPath =
    `plants/${plantId}/notes/${noteId}/${thumbnailFileName}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. 원본 업로드
  const { error: originalError } = await supabaseAdmin.storage
    .from(supabaseStorageBucket)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (originalError) {
    throw new Error(
      `Failed to upload photo: ${originalError.message}`
    );
  }

  // 2. Thumbnail 생성
  const thumbnailBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: 250,
      height: 250,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 75,
    })
    .toBuffer();

  // 3. Thumbnail 업로드
  const { error: thumbnailError } = await supabaseAdmin.storage
    .from(supabaseStorageBucket)
    .upload(thumbnailPath, thumbnailBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (thumbnailError) {
    // 원본은 이미 올라갔으므로 실패 시 원본도 제거
    await supabaseAdmin.storage
      .from(supabaseStorageBucket)
      .remove([filePath]);

    throw new Error(
      `Failed to upload thumbnail: ${thumbnailError.message}`
    );
  }

  return {
    fileName,
    filePath,
    thumbnailPath,
  };
}

export async function deleteGardenPhoto(filePath: string) {
  // Old local photos are saved as /uploads/...
  // Do not try to delete those from Supabase Storage.
  if (filePath.startsWith("/uploads/")) {
    return;
  }

  const { error } = await supabaseAdmin.storage
    .from(supabaseStorageBucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}

export async function getGardenPhotoUrl(filePath: string) {
  // Old local photos can still be displayed from public/uploads.
  if (filePath.startsWith("/uploads/")) {
    return filePath;
  }

  // Already-public full URL, just in case.
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(supabaseStorageBucket)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    throw new Error(`Failed to create signed photo URL: ${error.message}`);
  }

  return data.signedUrl;
}
