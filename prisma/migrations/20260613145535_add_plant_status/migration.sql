-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantCode" TEXT NOT NULL,
    "areaId" INTEGER,
    "categoryId" INTEGER,
    "plantName" TEXT NOT NULL,
    "scientificName" TEXT,
    "identifyStatus" TEXT NOT NULL DEFAULT 'Unknown',
    "plantStatus" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plant_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlantCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("areaId", "categoryId", "createdAt", "id", "identifyStatus", "plantCode", "plantName", "scientificName", "updatedAt") SELECT "areaId", "categoryId", "createdAt", "id", "identifyStatus", "plantCode", "plantName", "scientificName", "updatedAt" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE UNIQUE INDEX "Plant_plantCode_key" ON "Plant"("plantCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
