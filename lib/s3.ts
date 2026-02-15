/**
 * S3 proxy helper
 * Streams files from S3 bucket to the client
 */

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'kerio-static-files';
const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BASE_URL = process.env.S3_BASE_URL || `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.exe': 'application/octet-stream',
  '.msi': 'application/octet-stream',
  '.dmg': 'application/octet-stream',
  '.iso': 'application/octet-stream',
  '.img': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.ovf': 'application/octet-stream',
  '.vmdk': 'application/octet-stream',
  '.deb': 'application/octet-stream',
  '.rpm': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

function getContentType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * Fetch a file from S3 and return it as a Response
 * @param s3Key - The key (path) of the file in S3
 */
export async function proxyS3File(s3Key: string): Promise<Response> {
  const s3Url = `${S3_BASE_URL}/${s3Key}`;

  const s3Response = await fetch(s3Url);

  if (!s3Response.ok) {
    return new Response('File not found', { status: 404 });
  }

  const contentType = getContentType(s3Key);

  return new Response(s3Response.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      ...(s3Response.headers.get('content-length')
        ? { 'Content-Length': s3Response.headers.get('content-length')! }
        : {}),
    },
  });
}
