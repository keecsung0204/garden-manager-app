/*
  Warnings:

  - You are about to drop the column `areaId` on the `IrrigationZone` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `IrrigationZone` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "areaCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "irrigationZoneId" INTEGER,
    "irrigationMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Area_irrigationZoneId_fkey" FOREIGN KEY ("irrigationZoneId") REFERENCES "IrrigationZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Area" ("areaCode", "createdAt", "id", "name", "updatedAt") SELECT "areaCode", "createdAt", "id", "name", "updatedAt" FROM "Area";
DROP TABLE "Area";
ALTER TABLE "new_Area" RENAME TO "Area";
CREATE UNIQUE INDEX "Area_areaCode_key" ON "Area"("areaCode");
CREATE TABLE "new_IrrigationZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoneCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalSystem" TEXT,
    "externalZoneNo" INTEGER,
    "externalId" TEXT,
    "frequencyDays" INTEGER,
    "runMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_IrrigationZone" ("createdAt", "frequencyDays", "id", "name", "notes", "runMinutes", "updatedAt", "zoneCode") SELECT "createdAt", "frequencyDays", "id", "name", "notes", "runMinutes", "updatedAt", "zoneCode" FROM "IrrigationZone";
DROP TABLE "IrrigationZone";
ALTER TABLE "new_IrrigationZone" RENAME TO "IrrigationZone";
CREATE UNIQUE INDEX "IrrigationZone_zoneCode_key" ON "IrrigationZone"("zoneCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
