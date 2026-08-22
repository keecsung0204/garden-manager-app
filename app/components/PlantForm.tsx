import CareGuidePasteHelper from "./CareGuidePasteHelper";
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
    chatgptUrl?: string | null;
    speciesId?: number | null;

    waterNeedLevel?: number | null;
    sunNeedLevel?: number | null;
    moistureCheckDepthCm?: number | null;
    moistureTrigger?: number | null;
    wateringGuide?: string | null;
};

type PlantFormProps = {
    action: (formData: FormData) => void;
    areas: Area[];
    categories: PlantCategory[];
    statuses: PlantStatus[];
    defaultValues?: PlantFormValues;
    submitLabel?: string;
    species: PlantSpecies[];
};

type PlantSpecies = {
    id: number;
    commonName: string;
    scientificName: string;
    cultivar: string | null;
};

export default function PlantForm({
    action,
    areas,
    categories,
    statuses,
    species,
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
                <label htmlFor="speciesId">Species</label>
                <select
                    id="speciesId"
                    name="speciesId"
                    defaultValue={defaultValues?.speciesId?.toString() || ""}
                >
                    <option value="">Species 선택</option>

                    {species.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.commonName} - {item.scientificName}
                            {item.cultivar ? ` (${item.cultivar})` : ""}
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

            <CareGuidePasteHelper />

            <div className="form-row">
                <label htmlFor="waterNeedLevel">Water Need Level</label>
                <select
                    id="waterNeedLevel"
                    name="waterNeedLevel"
                    defaultValue={defaultValues?.waterNeedLevel?.toString() || ""}
                >
                    <option value="">선택 안 함</option>
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="sunNeedLevel">Sun Need Level</label>
                <select
                    id="sunNeedLevel"
                    name="sunNeedLevel"
                    defaultValue={defaultValues?.sunNeedLevel?.toString() || ""}
                >
                    <option value="">선택 안 함</option>
                    <option value="1">1 - Very Low</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Very High</option>
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="moistureCheckDepthCm">Moisture Check Depth (cm)</label>
                <input
                    id="moistureCheckDepthCm"
                    name="moistureCheckDepthCm"
                    type="number"
                    min="0"
                    defaultValue={defaultValues?.moistureCheckDepthCm ?? ""}
                />
            </div>

            <div className="form-row">
                <label htmlFor="moistureTrigger">Moisture Trigger</label>
                <input
                    id="moistureTrigger"
                    name="moistureTrigger"
                    type="number"
                    min="0"
                    defaultValue={defaultValues?.moistureTrigger ?? ""}
                />
            </div>

            <div className="form-row">
                <label htmlFor="wateringGuide">Watering Guide</label>
                <textarea
                    id="wateringGuide"
                    name="wateringGuide"
                    rows={4}
                    defaultValue={defaultValues?.wateringGuide || ""}
                />
            </div>
            <div className="form-row">
                <label htmlFor="chatgptUrl">ChatGPT Consultation URL</label>
                <input
                    id="chatgptUrl"
                    name="chatgptUrl"
                    type="url"
                    placeholder="https://chatgpt.com/c/..."
                    defaultValue={defaultValues?.chatgptUrl || ""}
                />
            </div>  
            <div className="form-actions">
                <button type="submit">{submitLabel}</button>
            </div>
         
        </form>
    );
}