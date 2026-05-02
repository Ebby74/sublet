import { prisma } from '@/lib/prisma';

interface ContentVersion {
  version: number;
  text: string;
  createdAt: string;
  createdBy: string;
  source: 'ai' | 'manual';
}

export async function getContentHistory(
  roomId: string
): Promise<{ success: boolean; history?: ContentVersion[]; error?: string }> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { descriptionHistory: true },
  });

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  try {
    const history = room.descriptionHistory ? JSON.parse(room.descriptionHistory) : [];
    return { success: true, history };
  } catch {
    return { success: true, history: [] };
  }
}

export async function addContentVersion(
  roomId: string,
  text: string,
  userId: string,
  source: 'ai' | 'manual' = 'manual'
): Promise<{ success: boolean; version?: number; error?: string }> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { descriptionHistory: true, descriptionV2: true },
  });

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  let history: ContentVersion[] = [];
  try {
    history = room.descriptionHistory ? JSON.parse(room.descriptionHistory) : [];
  } catch {
    history = [];
  }

  const newVersion = history.length > 0 ? Math.max(...history.map((h) => h.version)) + 1 : 1;

  const newEntry: ContentVersion = {
    version: newVersion,
    text,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    source,
  };

  history.push(newEntry);

  // Keep last 10 versions only
  const trimmedHistory = history.slice(-10);

  await prisma.room.update({
    where: { id: roomId },
    data: {
      descriptionV2: text,
      descriptionHistory: JSON.stringify(trimmedHistory),
    },
  });

  return { success: true, version: newVersion };
}

export async function revertToVersion(
  roomId: string,
  version: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await getContentHistory(roomId);
  if (!result.success || !result.history) {
    return { success: false, error: 'Room not found' };
  }

  const targetVersion = result.history.find((h) => h.version === version);
  if (!targetVersion) {
    return { success: false, error: 'Version not found' };
  }

  return addContentVersion(roomId, targetVersion.text, userId, targetVersion.source as 'ai' | 'manual');
}