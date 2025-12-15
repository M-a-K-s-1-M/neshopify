'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import type { BlockInstanceDto } from "@/lib/types";

interface HeroBrandHighlightProps {
    block: BlockInstanceDto;
}

export function HeroBrandHighlightBlock({ block }: HeroBrandHighlightProps) {
    const data = block.data ?? {};
    const stats = Array.isArray(data.stats) ? data.stats : [];
    const heading = typeof data.heading === "string" ? data.heading : block.template.title;
    const subheading = typeof data.subheading === "string" ? data.subheading : "";
    const mediaUrl = typeof data.mediaUrl === "string" ? data.mediaUrl : undefined;
    const ctaPrimary = data.ctaPrimary as { label?: string; href?: string } | undefined;
    const ctaSecondary = data.ctaSecondary as { label?: string; href?: string } | undefined;

    return (
        <section className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
                <div className="space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                        {heading}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {ctaPrimary && (
                        <Button asChild size="lg">
                            <Link href={ctaPrimary.href ?? "#"}>{ctaPrimary.label ?? "Попробовать"}</Link>
                        </Button>
                    )}
                    {ctaSecondary && (
                        <Button variant="ghost" asChild size="lg">
                            <Link href={ctaSecondary.href ?? "#"}>{ctaSecondary.label ?? "Подробнее"}</Link>
                        </Button>
                    )}
                </div>

                {stats.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {stats.map((stat: any, index: number) => (
                            <Card key={`${stat.label}-${index}`} className="p-4">
                                <p className="text-2xl font-semibold">{stat?.value ?? "—"}</p>
                                <p className="text-sm text-muted-foreground">{stat?.label ?? "Показатель"}</p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-2xl border bg-muted/40">
                {mediaUrl ? (
                    <Image src={mediaUrl} alt={heading} fill className="object-cover" />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
                        <Separator className="mb-4 w-16" />
                        Добавьте изображение бренда в настройках блока
                    </div>
                )}
            </div>
        </section>
    );
}
