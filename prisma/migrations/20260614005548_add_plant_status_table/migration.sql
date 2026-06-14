/*
  Warnings:

  - You are about to drop the column `plantStatus` on the `Plant` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PlantStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "statusCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "statusId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plant_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlantCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plant_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PlantStatus" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("areaId", "categoryId", "createdAt", "id", "identifyStatus", "plantCode", "plantName", "scientificName", "updatedAt") SELECT "areaId", "categoryId", "createdAt", "id", "identifyStatus", "plantCode", "plantName", "scientificName", "updatedAt" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
CREATE UNIQUE INDEX "Plant_plantCode_key" ON "Plant"("plantCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PlantStatus_statusCode_key" ON "PlantStatus"("statusCode");
