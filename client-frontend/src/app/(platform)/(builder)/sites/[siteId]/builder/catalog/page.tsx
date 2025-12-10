"use client";

import { useMemo } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components";
import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { CatalogWorkspace } from "@/components/builder/catalog-workspace";

export default function BuilderCatalog() {
    const params = useParams<{ siteId?: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const siteId = useMemo(() => {
        const raw = params?.siteId;
        if (!raw) return undefined;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params?.siteId]);

    const mode = (searchParams?.get("mode") ?? "products") === "blocks" ? "blocks" : "products";

    const switchMode = (nextMode: "products" | "blocks") => {
        if (!pathname) return;
        if (mode === nextMode) return;
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        if (nextMode === "products") {
            params.delete("mode");
        } else {
            params.set("mode", "blocks");
        }
        const query = params.toString();
        const target = query ? `${pathname}?${query}` : pathname;
        router.replace(target, { scroll: false });
    };

    if (!siteId) {
        return (
            <section className="space-y-4 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                <h1 className="text-xl font-semibold text-foreground">Конструктор каталога недоступен</h1>
                <p>Укажите идентификатор сайта в адресе (например, /sites/ID/builder/catalog), чтобы открыть рабочее пространство.</p>
            </section>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Страница каталога</p>
                    <h1 className="text-xl font-semibold">Выберите режим редактирования</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={mode === "products" ? "default" : "outline"}
                        onClick={() => switchMode("products")}
                    >
                        Карточки товаров
                    </Button>
                    <Button
                        type="button"
                        variant={mode === "blocks" ? "default" : "outline"}
                        onClick={() => switchMode("blocks")}
                    >
                        Блоки страницы
                    </Button>
                </div>
            </div>

            {mode === "blocks" ? (
                <BuilderWorkspace siteId={siteId} pageSlug="catalog" />
            ) : (
                <CatalogWorkspace siteId={siteId} />
            )}
        </div>
    );
}
