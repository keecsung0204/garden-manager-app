"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: number;
  categoryCode: string;
  name: string;
};

type CategoryFilterProps = {
  categories: Category[];
  selectedCategoryId?: string;
};

export default function CategoryFilter({
  categories,
  selectedCategoryId = "",
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const categoryId = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    const queryString = params.toString();

    router.push(queryString ? `/?${queryString}` : "/");
  }

  return (
    <select
      name="categoryId"
      value={selectedCategoryId}
      onChange={handleChange}
    >
      <option value="">All</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.categoryCode} - {category.name}
        </option>
      ))}
    </select>
  );
}