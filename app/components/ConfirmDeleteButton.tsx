"use client";

export default function ConfirmDeleteButton() {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm("정말 이 Note를 삭제할까요?");

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" className="delete-button" onClick={handleClick}>
      Delete
    </button>
  );
}