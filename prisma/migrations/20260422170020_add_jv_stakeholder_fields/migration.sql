-- AlterTable
ALTER TABLE "Property" ADD COLUMN "jvStakeholderId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "jvProperties" TEXT;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'single',
    "beds" INTEGER NOT NULL DEFAULT 1,
    "baths" INTEGER NOT NULL DEFAULT 1,
    "areaSqft" INTEGER,
    "rentSen" INTEGER NOT NULL,
    "depositSen" INTEGER,
    "photos" TEXT,
    "videos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Room_propertyId_idx" ON "Room"("propertyId");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_deletedAt_idx" ON "Room"("deletedAt");
