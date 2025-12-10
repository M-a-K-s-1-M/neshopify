"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";

export default function BuilderPage() {
    const params = useParams<{ siteId?: string; pageSlug?: string }>();

    const siteId = useMemo(() => {
        const raw = params?.siteId;
        if (!raw) return undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.siteId]);

    const pageSlug = useMemo(() => {
        const raw = params?.pageSlug;
        if (!raw) return undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.pageSlug]);

    if (!siteId || !pageSlug) {
        return (
            <section className="space-y-4 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                <h1 className="text-xl font-semibold text-foreground">Конструктор недоступен</h1>
                <p>Укажите сайт и страницу в адресе (например, /sites/ID/builder/home), чтобы открыть рабочее пространство.</p>
            </section>
        );
    }

    return <BuilderWorkspace siteId={siteId} pageSlug={pageSlug} />;
}
