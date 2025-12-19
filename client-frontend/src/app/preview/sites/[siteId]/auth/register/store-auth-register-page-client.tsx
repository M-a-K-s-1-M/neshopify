"use client";

import { StoreRegisterForm } from "@/components/shared/forms/store-register-form";

export default function StoreAuthRegisterPageClient({ siteId }: { siteId: string }) {
    const basePath = `/preview/sites/${siteId}`;

    return (
        <main className="min-h-dvh bg-background px-6 py-10">
            <StoreRegisterForm siteId={siteId} basePath={basePath} />
        </main>
    );
}
