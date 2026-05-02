/**
 * Post History Service
 * 
 * Tracks all marketing posts for rooms with status and error tracking.
 */

import { prisma } from '@/lib/prisma';

export interface CreatePostInput {
  roomId: string;
  userId: string;
  channel: string;
  content?: string;
  mediaUrl?: string;
  postId?: string;
  status?: 'pending' | 'published' | 'failed';
  error?: string;
}

export async function createPost(input: CreatePostInput) {
  return prisma.marketingPost.create({
    data: {
      roomId: input.roomId,
      userId: input.userId,
      channel: input.channel,
      content: input.content,
      mediaUrl: input.mediaUrl,
      postId: input.postId,
      status: input.status ?? 'pending',
      error: input.error,
    },
  });
}

export async function getPostsByRoom(roomId: string) {
  return prisma.marketingPost.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPostsByUser(userId: string) {
  return prisma.marketingPost.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markPostPublished(id: string, postId: string) {
  return prisma.marketingPost.update({
    where: { id },
    data: { status: 'published', postId },
  });
}

export async function markPostFailed(id: string, error: string) {
  return prisma.marketingPost.update({
    where: { id },
    data: { status: 'failed', error },
  });
}