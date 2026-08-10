-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IdentifyStatus" AS ENUM ('Unknown', 'Tentative', 'Confirmed');

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "areaCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "irrigationZoneId" INTEGER,
    "irrigationMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantCategory" (
    "id" SERIAL NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" SERIAL NOT NULL,
    "plantCode" TEXT NOT NULL,
    "areaId" INTEGER,
    "categoryId" INTEGER,
    "plantName" TEXT NOT NULL,
    "scientificName" TEXT,
    "identifyStatus" "IdentifyStatus" NOT NULL DEFAULT 'Unknown',
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantNote" (
    "id" SERIAL NOT NULL,
    "plantId" INTEGER NOT NULL,
    "noteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noteType" TEXT,
    "noteTypeId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteType" (
    "id" SERIAL NOT NULL,
    "typeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantStatus" (
    "id" SERIAL NOT NULL,
    "statusCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantPhoto" (
    "id" SERIAL NOT NULL,
    "plantId" INTEGER NOT NULL,
    "noteId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "caption" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrrigationZone" (
    "id" SERIAL NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalSystem" TEXT,
    "externalZoneNo" INTEGER,
    "externalId" TEXT,
    "frequencyDays" INTEGER,
    "runMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IrrigationZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantIrrigation" (
    "id" SERIAL NOT NULL,
    "plantId" INTEGER NOT NULL,
    "irrigationZoneId" INTEGER,
    "emitterGph" DOUBLE PRECISION,
    "emitterCount" INTEGER,
    "runMinutesOverride" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantIrrigation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_areaCode_key" ON "Area"("areaCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlantCategory_categoryCode_key" ON "PlantCategory"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_plantCode_key" ON "Plant"("plantCode");

-- CreateIndex
CREATE UNIQUE INDEX "NoteType_typeCode_key" ON "NoteType"("typeCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlantStatus_statusCode_key" ON "PlantStatus"("statusCode");

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationZone_zoneCode_key" ON "IrrigationZone"("zoneCode");

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_irrigationZoneId_fkey" FOREIGN KEY ("irrigationZoneId") REFERENCES "IrrigationZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlantCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PlantStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantNote" ADD CONSTRAINT "PlantNote_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantNote" ADD CONSTRAINT "PlantNote_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "NoteType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPhoto" ADD CONSTRAINT "PlantPhoto_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPhoto" ADD CONSTRAINT "PlantPhoto_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "PlantNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantIrrigation" ADD CONSTRAINT "PlantIrrigation_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantIrrigation" ADD CONSTRAINT "PlantIrrigation_irrigationZoneId_fkey" FOREIGN KEY ("irrigationZoneId") REFERENCES "IrrigationZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

