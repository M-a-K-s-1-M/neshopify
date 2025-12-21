import StorefrontIdSlugAuthLoginPageClient from "./storefront-id-slug-auth-login-page-client";

export default async function StorefrontIdSlugAuthPage({
    params,
}: {
    params: Promise<{ siteSlug: string; siteName: string }>;
}) {
    const { siteSlug, siteName } = await params;
    return <StorefrontIdSlugAuthLoginPageClient siteId={siteSlug} siteSlug={siteName} />;
}
