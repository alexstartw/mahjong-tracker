-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "venue" TEXT NOT NULL,
    "stakes" TEXT,
    "base" INTEGER,
    "unit" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GameSession" ("createdAt", "date", "id", "note", "stakes", "updatedAt", "venue") SELECT "createdAt", "date", "id", "note", "stakes", "updatedAt", "venue" FROM "GameSession";
DROP TABLE "GameSession";
ALTER TABLE "new_GameSession" RENAME TO "GameSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
