-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProfileAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileText" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ProfileAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProfileAnalysis" ("createdAt", "id", "profileText", "result", "updatedAt", "userId") SELECT "createdAt", "id", "profileText", "result", "updatedAt", "userId" FROM "ProfileAnalysis";
DROP TABLE "ProfileAnalysis";
ALTER TABLE "new_ProfileAnalysis" RENAME TO "ProfileAnalysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
