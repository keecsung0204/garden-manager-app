type Area = {
    id: number;
    areaCode: string;
    name: string;
};

type PlantCategory = {
    id: number;
    categoryCode: string;
    name: string;
};

type PlantStatus = {
    id: number;
    statusCode: string;
    name: string;
};

type PlantFormValues = {
    plantCode?: string;
    plantName?: string;
    areaId?: number | null;
    categoryId?: number | null;
    identifyStatus?: "Unknown" | "Tentative" | "Confirmed";
    statusId?: number | null;
    scientificName?: string | null;
};

type PlantFormProps = {
    action: (formData: FormData) => void;
    areas: Area[];
    categories: PlantCategory[];
    statuses: PlantStatus[];
    defaultValues?: PlantFormValues;
    submitLabel?: string;
};

export default function PlantForm({
    action,
    areas,
    categories,
    statuses,
    defaultValues,
    submitLabel = "Save Plant",
}: PlantFormProps) {
    return (
        <form className="form-grid" action={action}>
            <div className="form-row">
                <label htmlFor="plantCode">Plant Code</label>
                <input
                    id="plantCode"
                    name="plantCode"
                    defaultValue={defaultValues?.plantCode || ""}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="plantName">Plant Name</label>
                <input
                    id="plantName"
                    name="plantName"
                    defaultValue={defaultValues?.plantName || ""}
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="areaId">Area</label>
                <select
                    id="areaId"
                    name="areaId"
                    required
                    defaultValue={defaultValues?.areaId?.toString() || ""}
                >
                    <option value="">장소 선택</option>
                    {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                            {area.areaCode} - {area.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="categoryId">Category</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue={defaultValues?.categoryId?.toString() || ""}
                >
                    <option value="">분류 선택</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.categoryCode} - {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="identifyStatus">Identify Status</label>
                <select
                    id="identifyStatus"
                    name="identifyStatus"
                    defaultValue={defaultValues?.identifyStatus || "Unknown"}
                >
                    <option value="Unknown">Unknown</option>
                    <option value="Tentative">Tentative</option>
                    <option value="Confirmed">Confirmed</option>
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="statusId">Plant Status</label>
                <select
                    id="statusId"
                    name="statusId"
                    required
                    defaultValue={defaultValues?.statusId?.toString() || ""}
                >
                    <option value="">상태 선택</option>
                    {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                            {status.statusCode} - {status.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="scientificName">Scientific Name</label>
                <input
                    id="scientificName"
                    name="scientificName"
                    defaultValue={defaultValues?.scientificName || ""}
                />
            </div>

            <div className="form-actions">
                <button type="submit">{submitLabel}</button>
            </div>
        </form>
    );
}