-- CreateTable
CREATE TABLE "IrrigationZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoneCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" INTEGER,
    "method" TEXT NOT NULL,
    "frequencyDays" INTEGER,
    "runMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IrrigationZone_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantIrrigation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "irrigationZoneId" INTEGER,
    "emitterGph" REAL,
    "emitterCount" INTEGER,
    "runMinutesOverride" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlantIrrigation_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantIrrigation_irrigationZoneId_fkey" FOREIGN KEY ("irrigationZoneId") REFERENCES "IrrigationZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationZone_zoneCode_key" ON "IrrigationZone"("zoneCode");
