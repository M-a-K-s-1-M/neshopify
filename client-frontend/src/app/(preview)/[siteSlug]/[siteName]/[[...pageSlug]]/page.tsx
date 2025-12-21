import StorefrontIdSlugPageClient from "./storefront-id-slug-page-client";

export default async function StorefrontIdSlugPage({
    params,
}: {
    params: Promise<{ siteSlug: string; siteName: string; pageSlug?: string[] }>;
}) {
    const { siteSlug, siteName, pageSlug } = await params;
    return <StorefrontIdSlugPageClient siteId={siteSlug} siteSlug={siteName} pageSlug={pageSlug} />;
}
