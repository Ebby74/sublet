import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { addMediaToRoom, removeMediaFromRoom } from '@/services/room-service';
import { uploadFile, deleteFile, isR2Configured, type UploadResult } from '@/lib/r2';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function validateFile(file: File): { valid: boolean; error?: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size: 10MB' };
  }

  return { valid: true };
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };
  return map[mimeType] || '';
}

function getMediaType(mimeType: string): 'photos' | 'videos' {
  return ALLOWED_VIDEO_TYPES.includes(mimeType) ? 'videos' : 'photos';
}

async function saveLocal(file: File): Promise<{ url: string; key: string }> {
  await ensureUploadDir();

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getExtension(file.type);
  const filename = `${timestamp}-${random}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return { url: `/uploads/${filename}`, key: filename };
}

function extractKeyFromUrl(url: string): string {
  if (url.startsWith('/uploads/')) {
    return url.replace('/uploads/', '');
  }

  if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
    return url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
  }

  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const roomId = formData.get('roomId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = getExtension(file.type);
    const key = `rooms/${roomId || 'misc'}/${timestamp}-${random}${ext}`;

    let result: UploadResult;

    if (isR2Configured) {
      result = await uploadFile(file, key);

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
      }
    } else {
      const local = await saveLocal(file);
      result = { success: true, url: local.url, key: local.key };
    }

    if (roomId) {
      const mediaType = getMediaType(file.type);
      await addMediaToRoom(roomId, mediaType, result.url!);
    }

    const response: UploadResponse = {
      success: true,
      url: result.url,
      key: result.key,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const roomId = searchParams.get('roomId');
    const mediaType = searchParams.get('mediaType') as 'photos' | 'videos' | null;

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    if (roomId && mediaType) {
      await removeMediaFromRoom(roomId, mediaType, url);
    }

    const key = extractKeyFromUrl(url);

    if (isR2Configured && key) {
      await deleteFile(key);
    } else if (key && url.startsWith('/uploads/')) {
      const filepath = path.join(UPLOAD_DIR, key);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
