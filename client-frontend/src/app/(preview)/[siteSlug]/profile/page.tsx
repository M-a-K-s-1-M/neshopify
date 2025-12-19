import StorefrontSlugPageClient from "../[[...pageSlug]]/storefront-slug-page-client";

export default async function StorefrontProfilePage({
    params,
}: {
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    return <StorefrontSlugPageClient siteSlug={siteSlug} pageSlug={["profile"]} />;
}
