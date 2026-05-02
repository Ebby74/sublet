/*
  Warnings:

  - You are about to drop the column `propertyId` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `rentAmountSen` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `Room` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floorId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "roomId" TEXT;

-- CreateTable
CREATE TABLE "Floor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Floor_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Viewing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "result" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Viewing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Viewing_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "amountSen" INTEGER NOT NULL,
    "moveInDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "evaluatedBy" TEXT,
    "letter" BLOB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DamageReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaseId" TEXT NOT NULL,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterName" TEXT,
    "damageType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "description" TEXT NOT NULL,
    "photos" TEXT,
    "estimatedCostSen" INTEGER,
    "actualCostSen" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'reported',
    "repairNotes" TEXT,
    "repairedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DamageReport_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExitProcess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaseId" TEXT NOT NULL,
    "initiatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatedBy" TEXT,
    "expectedMoveOut" DATETIME NOT NULL,
    "actualMoveOut" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "checklistData" TEXT,
    "damagesFound" TEXT,
    "totalDeductionsSen" INTEGER NOT NULL DEFAULT 0,
    "depositReturnSen" INTEGER,
    "finalPaymentSen" INTEGER,
    "refundMethod" TEXT,
    "refundReference" TEXT,
    "refundDate" DATETIME,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExitProcess_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "monthlyRentSen" INTEGER NOT NULL,
    "depositSen" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "roomId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "legacyPropertyId" TEXT,
    CONSTRAINT "Lease_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lease" ("createdAt", "deletedAt", "depositSen", "endDate", "id", "monthlyRentSen", "startDate", "status", "tenantId", "updatedAt", "userId") SELECT "createdAt", "deletedAt", "depositSen", "endDate", "id", "monthlyRentSen", "startDate", "status", "tenantId", "updatedAt", "userId" FROM "Lease";
DROP TABLE "Lease";
ALTER TABLE "new_Lease" RENAME TO "Lease";
CREATE INDEX "Lease_roomId_idx" ON "Lease"("roomId");
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");
CREATE INDEX "Lease_userId_idx" ON "Lease"("userId");
CREATE INDEX "Lease_status_idx" ON "Lease"("status");
CREATE INDEX "Lease_deletedAt_idx" ON "Lease"("deletedAt");
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'apartment',
    "latitude" REAL,
    "longitude" REAL,
    "googlePlaceId" TEXT,
    "amenities" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "jvStakeholderId" TEXT,
    "jvSplit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "createdAt", "deletedAt", "id", "jvSplit", "jvStakeholderId", "name", "status", "type", "updatedAt", "userId") SELECT "address", "createdAt", "deletedAt", "id", "jvSplit", "jvStakeholderId", "name", "status", "type", "updatedAt", "userId" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE INDEX "Property_userId_idx" ON "Property"("userId");
CREATE INDEX "Property_status_idx" ON "Property"("status");
CREATE INDEX "Property_deletedAt_idx" ON "Property"("deletedAt");
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "floorId" TEXT NOT NULL,
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
    "description" TEXT,
    "descriptionV2" TEXT,
    "descriptionHistory" TEXT,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "vacantSince" DATETIME,
    "lastRentedAt" DATETIME,
    "vacancyNotes" TEXT,
    "maintenanceCostSen" INTEGER,
    "legacyPropertyId" TEXT,
    CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("areaSqft", "baths", "beds", "caption", "createdAt", "deletedAt", "depositSen", "description", "id", "name", "photos", "rentSen", "status", "type", "updatedAt", "videos") SELECT "areaSqft", "baths", "beds", "caption", "createdAt", "deletedAt", "depositSen", "description", "id", "name", "photos", "rentSen", "status", "type", "updatedAt", "videos" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE INDEX "Room_floorId_idx" ON "Room"("floorId");
CREATE INDEX "Room_status_idx" ON "Room"("status");
CREATE INDEX "Room_deletedAt_idx" ON "Room"("deletedAt");
CREATE INDEX "Room_vacantSince_idx" ON "Room"("vacantSince");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Floor_propertyId_idx" ON "Floor"("propertyId");

-- CreateIndex
CREATE INDEX "Floor_level_idx" ON "Floor"("level");

-- CreateIndex
CREATE INDEX "Viewing_roomId_idx" ON "Viewing"("roomId");

-- CreateIndex
CREATE INDEX "Viewing_prospectId_idx" ON "Viewing"("prospectId");

-- CreateIndex
CREATE INDEX "Viewing_scheduledAt_idx" ON "Viewing"("scheduledAt");

-- CreateIndex
CREATE INDEX "Viewing_status_idx" ON "Viewing"("status");

-- CreateIndex
CREATE INDEX "Offer_roomId_idx" ON "Offer"("roomId");

-- CreateIndex
CREATE INDEX "Offer_prospectId_idx" ON "Offer"("prospectId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "DamageReport_leaseId_idx" ON "DamageReport"("leaseId");

-- CreateIndex
CREATE INDEX "DamageReport_status_idx" ON "DamageReport"("status");

-- CreateIndex
CREATE INDEX "DamageReport_damageType_idx" ON "DamageReport"("damageType");

-- CreateIndex
CREATE INDEX "DamageReport_severity_idx" ON "DamageReport"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ExitProcess_leaseId_key" ON "ExitProcess"("leaseId");

-- CreateIndex
CREATE INDEX "ExitProcess_leaseId_idx" ON "ExitProcess"("leaseId");

-- CreateIndex
CREATE INDEX "ExitProcess_status_idx" ON "ExitProcess"("status");

-- CreateIndex
CREATE INDEX "ExitProcess_expectedMoveOut_idx" ON "ExitProcess"("expectedMoveOut");

-- CreateIndex
CREATE INDEX "Payment_roomId_idx" ON "Payment"("roomId");
