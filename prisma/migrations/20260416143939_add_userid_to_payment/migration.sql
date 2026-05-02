-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amountSen" INTEGER NOT NULL,
    "description" TEXT,
    "referenceNumber" TEXT,
    "paidAt" DATETIME,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "leaseId" TEXT,
    "tenantId" TEXT,
    "userId" TEXT,
    "category" TEXT,
    "incomeSource" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amountSen", "category", "createdAt", "deletedAt", "description", "dueDate", "id", "incomeSource", "leaseId", "paidAt", "referenceNumber", "status", "tenantId", "type", "updatedAt") SELECT "amountSen", "category", "createdAt", "deletedAt", "description", "dueDate", "id", "incomeSource", "leaseId", "paidAt", "referenceNumber", "status", "tenantId", "type", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_incomeSource_idx" ON "Payment"("incomeSource");
CREATE INDEX "Payment_leaseId_idx" ON "Payment"("leaseId");
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
