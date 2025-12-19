import { Suspense } from "react";
import StorefrontSlugAuthRegisterPageClient from "./storefront-slug-auth-register-page-client";

export default async function StorefrontSlugAuthRegisterPage({
    params,
}: {
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    return (
        <Suspense fallback={null}>
            <StorefrontSlugAuthRegisterPageClient siteSlug={siteSlug} />
        </Suspense>
    );
}
