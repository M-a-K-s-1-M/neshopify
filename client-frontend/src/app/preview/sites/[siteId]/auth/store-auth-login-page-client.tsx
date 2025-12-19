"use client";

import { StoreLoginForm } from "@/components/shared/forms/store-login-form";

export default function StoreAuthLoginPageClient({ siteId }: { siteId: string }) {
    const basePath = `/preview/sites/${siteId}`;

    return (
        <main className="min-h-dvh bg-background px-6 py-10">
            <StoreLoginForm siteId={siteId} basePath={basePath} />
        </main>
    );
}
