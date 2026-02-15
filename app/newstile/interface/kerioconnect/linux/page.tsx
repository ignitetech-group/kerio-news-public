import { getPageContent } from '@/lib/get-page';

export const dynamic = 'force-dynamic';

export default async function KerioConnectLinuxPage() {
  const htmlContent = await getPageContent(
    'kerioconnect-linux',
    'app/newstile/interface/kerioconnect/linux.html'
  );
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
