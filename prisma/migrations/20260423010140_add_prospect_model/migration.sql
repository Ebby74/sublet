-- AlterTable
ALTER TABLE "Property" ADD COLUMN "jvSplit" REAL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "caption" TEXT;
ALTER TABLE "Room" ADD COLUMN "description" TEXT;

-- CreateTable
CREATE TABLE "MarketingPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "postId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketingPost_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "utmData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "roomId" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Prospect_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prospect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MarketingPost_roomId_idx" ON "MarketingPost"("roomId");

-- CreateIndex
CREATE INDEX "MarketingPost_userId_idx" ON "MarketingPost"("userId");

-- CreateIndex
CREATE INDEX "MarketingPost_channel_idx" ON "MarketingPost"("channel");

-- CreateIndex
CREATE INDEX "MarketingPost_status_idx" ON "MarketingPost"("status");

-- CreateIndex
CREATE INDEX "Prospect_userId_idx" ON "Prospect"("userId");

-- CreateIndex
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");

-- CreateIndex
CREATE INDEX "Prospect_source_idx" ON "Prospect"("source");

-- CreateIndex
CREATE INDEX "Prospect_roomId_idx" ON "Prospect"("roomId");

-- CreateIndex
CREATE INDEX "Prospect_createdAt_idx" ON "Prospect"("createdAt");
