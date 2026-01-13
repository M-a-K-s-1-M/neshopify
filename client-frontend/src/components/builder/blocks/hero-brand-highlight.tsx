'use client'

import type { BlockInstanceDto } from "@/lib/types";

interface HeroBrandHighlightProps {
    block: BlockInstanceDto;
}

export function HeroBrandHighlightBlock({ block }: HeroBrandHighlightProps) {
    const data = block.data ?? {};
    const stats = Array.isArray(data.stats) ? data.stats : [];
    const heading = typeof data.heading === "string" ? data.heading : block.template.title;
    const subheading = typeof data.subheading === "string" ? data.subheading : "";

    return (
        <section className="rounded-2xl bg-card p-6 shadow-md">
            <div className="space-y-6">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                            {heading}
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>
                    </div>

                    {stats.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {stats.map((stat: any, index: number) => (
                                <div
                                    key={`${stat.label}-${index}`}
                                    className="relative overflow-hidden rounded-xl bg-linear-to-br from-muted via-background to-muted p-4 shadow-md"
                                >
                                    <div className="pointer-events-none absolute inset-0 opacity-30">
                                        <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-secondary/30" />
                                        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-primary/20" />
                                    </div>
                                    <div className="relative space-y-1">
                                        <p className="text-2xl font-semibold">{stat?.value ?? "—"}</p>
                                        <p className="text-sm text-muted-foreground">{stat?.label ?? "Показатель"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
