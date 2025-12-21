import StorefrontIdSlugAuthRegisterPageClient from "./storefront-id-slug-auth-register-page-client";

export default async function StorefrontIdSlugRegisterPage({
    params,
}: {
    params: Promise<{ siteSlug: string; siteName: string }>;
}) {
    const { siteSlug, siteName } = await params;
    return <StorefrontIdSlugAuthRegisterPageClient siteId={siteSlug} siteSlug={siteName} />;
}
