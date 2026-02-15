import { getPageContent } from '@/lib/get-page';

export const dynamic = 'force-dynamic';

export default async function KerioControlLinuxPage() {
  const htmlContent = await getPageContent(
    'keriocontrol-linux',
    'app/newstile/interface/keriocontrol/linux.html'
  );
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
