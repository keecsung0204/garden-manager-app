import "dotenv/config";
import prisma from "../lib/prisma";
import sharp from "sharp";
import {
  supabaseAdmin,
  supabaseStorageBucket,
} from "../lib/supabaseAdmin";

async function main() {
  const photos = await prisma.plantPhoto.findMany({
    where: {
      thumbnailPath: null,
      filePath: {
        not: {
          startsWith: "/uploads/",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Photos to process: ${photos.length}`);

  for (const photo of photos) {
    try {
      console.log(`Processing photo ${photo.id}: ${photo.filePath}`);

      const { data, error: downloadError } =
        await supabaseAdmin.storage
          .from(supabaseStorageBucket)
          .download(photo.filePath);

      if (downloadError || !data) {
        console.error(
          `Download failed for photo ${photo.id}:`,
          downloadError?.message
        );
        continue;
      }

      const originalBuffer = Buffer.from(
        await data.arrayBuffer()
      );

      const thumbnailBuffer = await sharp(originalBuffer)
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

      const lastSlash = photo.filePath.lastIndexOf("/");
      const directory = photo.filePath.substring(0, lastSlash);
      const originalName = photo.filePath.substring(lastSlash + 1);

      const thumbnailPath =
        `${directory}/thumb-${originalName}.jpg`;

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from(supabaseStorageBucket)
          .upload(thumbnailPath, thumbnailBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

      if (uploadError) {
        console.error(
          `Thumbnail upload failed for photo ${photo.id}:`,
          uploadError.message
        );
        continue;
      }

      await prisma.plantPhoto.update({
        where: {
          id: photo.id,
        },
        data: {
          thumbnailPath,
        },
      });

      console.log(`Done: photo ${photo.id}`);
    } catch (error) {
      console.error(`Failed photo ${photo.id}:`, error);
    }
  }

  console.log("Thumbnail generation finished.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });