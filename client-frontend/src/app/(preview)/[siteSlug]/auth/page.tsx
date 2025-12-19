import { Suspense } from "react";
import StorefrontSlugAuthLoginPageClient from "./storefront-slug-auth-login-page-client";

export default async function StorefrontSlugAuthLoginPage({
    params,
}: {
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    return (
        <Suspense fallback={null}>
            <StorefrontSlugAuthLoginPageClient siteSlug={siteSlug} />
        </Suspense>
    );
}
