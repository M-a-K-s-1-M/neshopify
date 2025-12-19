import StorefrontSlugPageClient from "../[[...pageSlug]]/storefront-slug-page-client";

export default async function StorefrontCartPage({
    params,
}: {
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    return <StorefrontSlugPageClient siteSlug={siteSlug} pageSlug={["cart"]} />;
}
