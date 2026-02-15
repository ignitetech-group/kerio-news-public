import { proxyS3File } from '@/lib/s3';

/**
 * Proxy /file/* to S3
 * These are Kerio product downloads (exe, iso, dmg, etc.)
 * S3 key: files_live/<filename>
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join('/');
  const s3Key = `files_live/${filePath}`;

  return proxyS3File(s3Key);
}
