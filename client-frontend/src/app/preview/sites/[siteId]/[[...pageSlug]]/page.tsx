import PreviewSitePageClient from "./preview-site-page-client";

export default async function PreviewSitePage({
    params,
}: {
    params: Promise<{ siteId: string; pageSlug?: string[] }>;
}) {
    const { siteId, pageSlug } = await params;
    return <PreviewSitePageClient siteId={siteId} pageSlug={pageSlug} />;
}
