"use client";

export default function ConfirmPhotoDeleteButton() {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm("정말 이 사진을 삭제할까요?");

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" className="photo-delete-button" onClick={handleClick}>
      Delete
    </button>
  );
}
