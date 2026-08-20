-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "moistureCheckDepthCm" INTEGER,
ADD COLUMN     "moistureTrigger" INTEGER,
ADD COLUMN     "sunNeedLevel" INTEGER,
ADD COLUMN     "waterNeedLevel" INTEGER,
ADD COLUMN     "wateringGuide" TEXT;
