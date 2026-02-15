import { getPageContent } from '@/lib/get-page';

export const dynamic = 'force-dynamic';

export default async function KerioConnectAllPage() {
  const htmlContent = await getPageContent(
    'kerioconnect-all',
    'app/newstile/interface/kerioconnect/all.html'
  );
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
