"use client";

import { useEffect, useState } from "react";

export default function PhotoInputPreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="form-row">
      <label htmlFor="photo">Add Photo</label>

      <input
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoChange}
      />

      {previewUrl && (
        <div className="selected-photo-preview">
          <div className="selected-photo-preview-label">Selected Photo</div>
          <img src={previewUrl} alt="Selected preview" />
        </div>
      )}
    </div>
  );
}