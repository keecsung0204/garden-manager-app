-- CreateTable
CREATE TABLE "NoteType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlantNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "noteDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noteType" TEXT,
    "noteTypeId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlantNote_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantNote_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "NoteType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlantNote" ("content", "createdAt", "id", "noteDate", "noteType", "plantId", "updatedAt") SELECT "content", "createdAt", "id", "noteDate", "noteType", "plantId", "updatedAt" FROM "PlantNote";
DROP TABLE "PlantNote";
ALTER TABLE "new_PlantNote" RENAME TO "PlantNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "NoteType_typeCode_key" ON "NoteType"("typeCode");
