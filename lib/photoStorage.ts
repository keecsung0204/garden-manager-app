import { randomUUID } from "crypto";
import { supabaseAdmin, supabaseStorageBucket } from "./supabaseAdmin";

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

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabaseAdmin.storage
    .from(supabaseStorageBucket)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  return {
    fileName,
    filePath,
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
