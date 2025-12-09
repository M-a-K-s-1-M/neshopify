'use client';

import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { CreateSiteBtn, HeaderPage, SiteCard } from "@/components";
import { SitesApi } from "@/lib/api/sites";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";

export default function Sites() {
    const {
        data: sites,
        isLoading,
        error,
    } = useQuery({
        queryKey: queryKeys.sites(),
        queryFn: SitesApi.list,
    });

    const errorMessage = error ? getRequestErrorMessage(error, "Не удалось загрузить сайты") : null;
    const showEmpty = !isLoading && !error && (sites?.length ?? 0) === 0;

    return (
        <section className="max-w-5xl mx-auto space-y-6">
            <HeaderPage>
                <CreateSiteBtn />
            </HeaderPage>

            {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загружаем сайты...
                </div>
            ) : null}

            {errorMessage ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

            {showEmpty ? (
                <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10 text-center">
                    <p className="text-lg font-semibold">У вас пока нет сайтов</p>
                    <p className="text-sm text-muted-foreground">Создайте первый проект, чтобы начать работать с конструктором.</p>
                </div>
            ) : null}

            {!isLoading && !showEmpty && sites ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {sites.map((site) => (
                        <SiteCard key={site.id} site={site} />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
