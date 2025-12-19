import { Suspense } from "react";
import StoreAuthLoginPageClient from "./store-auth-login-page-client";

export default async function StoreAuthLoginPage({
    params,
}: {
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;
    return (
        <Suspense fallback={null}>
            <StoreAuthLoginPageClient siteId={siteId} />
        </Suspense>
    );
}
