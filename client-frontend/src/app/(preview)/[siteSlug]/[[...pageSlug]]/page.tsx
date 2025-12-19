import StorefrontSlugPageClient from "./storefront-slug-page-client";

export default async function StorefrontSlugPage({
    params,
}: {
    params: Promise<{ siteSlug: string; pageSlug?: string[] }>;
}) {
    const { siteSlug, pageSlug } = await params;
    return <StorefrontSlugPageClient siteSlug={siteSlug} pageSlug={pageSlug} />;
}
