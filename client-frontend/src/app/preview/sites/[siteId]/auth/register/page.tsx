import { Suspense } from "react";
import StoreAuthRegisterPageClient from "./store-auth-register-page-client";

export default async function StoreAuthRegisterPage({
    params,
}: {
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;
    return (
        <Suspense fallback={null}>
            <StoreAuthRegisterPageClient siteId={siteId} />
        </Suspense>
    );
}
