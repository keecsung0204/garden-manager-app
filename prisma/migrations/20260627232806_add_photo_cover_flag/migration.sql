-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlantPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantId" INTEGER NOT NULL,
    "noteId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "caption" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlantPhoto_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantPhoto_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "PlantNote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlantPhoto" ("caption", "createdAt", "fileName", "filePath", "id", "noteId", "plantId", "updatedAt") SELECT "caption", "createdAt", "fileName", "filePath", "id", "noteId", "plantId", "updatedAt" FROM "PlantPhoto";
DROP TABLE "PlantPhoto";
ALTER TABLE "new_PlantPhoto" RENAME TO "PlantPhoto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
