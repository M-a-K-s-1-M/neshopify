"use client";

import Link from "next/link";

import { useSitesQuery } from "@/lib/query/hooks";
import { getRequestErrorMessage } from "@/lib/utils/error";

export default function PreviewIndexPage() {
    const { data: sites, isLoading, error } = useSitesQuery();

    const errorMessage = error ? getRequestErrorMessage(error, "Не удалось загрузить список сайтов") : null;

    return (
        <main className="mx-auto w-full max-w-5xl px-6 py-10">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Preview сайтов</h1>
                <p className="text-sm text-muted-foreground">
                    Выберите сайт, чтобы открыть полноценный предпросмотр с работающей навигацией.
                </p>
            </header>

            {errorMessage ? (
                <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}

            {isLoading ? (
                <div className="mt-6 rounded-xl border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
                    Загрузка...
                </div>
            ) : null}

            {!isLoading && sites && sites.length === 0 ? (
                <div className="mt-6 rounded-xl border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
                    У вас пока нет сайтов. Создайте сайт в конструкторе, затем вернитесь сюда.
                </div>
            ) : null}

            {!isLoading && sites && sites.length > 0 ? (
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sites.map((site) => (
                        <li key={site.id} className="rounded-xl border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-base font-semibold">{site.name}</p>
                                    <p className="text-xs text-muted-foreground">slug: {site.slug}</p>
                                </div>

                                <Link
                                    className="text-sm font-medium text-primary hover:underline"
                                    href={`/preview/sites/${site.id}`}
                                >
                                    Открыть
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}
        </main>
    );
}
