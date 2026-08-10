"use client";

import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_SIZE = 1600;
const JPEG_QUALITY = 0.82;

export default function PhotoInputPreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function resizeImage(file: File): Promise<File> {
    const sourceUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("사진을 읽을 수 없습니다."));
        img.src = sourceUrl;
      });

      let width = image.naturalWidth;
      let height = image.naturalHeight;

      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        const scale = Math.min(
          MAX_IMAGE_SIZE / width,
          MAX_IMAGE_SIZE / height
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("사진 처리 기능을 사용할 수 없습니다.");
      }

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("사진 축소에 실패했습니다."));
            }
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      });

      const originalName = file.name.replace(/\.[^/.]+$/, "");

      return new File([blob], `${originalName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const originalFile = event.target.files?.[0];

    if (!originalFile) {
      setPreviewUrl(null);
      return;
    }

    setProcessing(true);

    try {
      const resizedFile = await resizeImage(originalFile);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(resizedFile);

      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files;
      }

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return URL.createObjectURL(resizedFile);
      });

      console.log(
        `Photo resized: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB -> ${(resizedFile.size / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "사진을 처리하는 중 문제가 발생했습니다."
      );

      event.target.value = "";
      setPreviewUrl(null);
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div>
      <div>Add Photo</div>

      <input
        ref={inputRef}
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        disabled={processing}
      />

      {processing && <div>Preparing photo...</div>}

      {previewUrl && (
        <div className="selected-photo-preview">
          <div className="selected-photo-preview-label">
            Selected Photo
          </div>
          <img src={previewUrl} alt="Selected preview" />
        </div>
      )}
    </div>
  );
}