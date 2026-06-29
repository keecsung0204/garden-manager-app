"use client";

import { useState } from "react";

type NotePhotoViewerProps = {
  filePath: string;
  altText: string;
};

export default function NotePhotoViewer({
  filePath,
  altText,
}: NotePhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="note-photo-button"
        onClick={() => setIsOpen(true)}
      >
        <img className="note-photo" src={filePath} alt={altText} />
      </button>

      {isOpen && (
        <div className="photo-lightbox">
          <button
            type="button"
            className="photo-lightbox-backdrop"
            onClick={() => setIsOpen(false)}
            aria-label="Close photo"
          />

          <div className="photo-lightbox-content">
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close photo"
            >
              ×
            </button>

            <img src={filePath} alt={altText} />
          </div>
        </div>
      )}
    </>
  );
}