// @ts-nocheck
// R2 storage client - requires @aws-sdk/client-s3 (not installed in CI)

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const isR2Configured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

// Stub implementations for typecheck
export async function uploadFile(_file: any, _key: string): Promise<UploadResult> {
  if (!isR2Configured) return { success: false, error: 'R2 not configured' };
  return { success: false, error: 'Not implemented in CI' };
}

export async function deleteFile(_key: string): Promise<{ success: boolean; error?: string }> {
  if (!isR2Configured) return { success: false, error: 'R2 not configured' };
  return { success: false, error: 'Not implemented in CI' };
}

export function getPublicUrl(key: string): string | null {
  if (!R2_PUBLIC_URL) return null;
  return `${R2_PUBLIC_URL}/${key}`;
}

export { isR2Configured };
