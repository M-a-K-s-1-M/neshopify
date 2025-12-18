'use client'

import Link from 'next/link'

import type { BlockInstanceDto } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface BannersProps {
    block: BlockInstanceDto
}

type BannerVariant = 'banner-01' | 'banner-02' | 'banner-03'

function getBannerVariant(value: unknown): BannerVariant {
    if (value === 'banner-01' || value === 'banner-02' || value === 'banner-03') {
        return value
    }
    return 'banner-01'
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function BannerPill({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
            {children}
        </span>
    )
}

function BannerPillOnGradient({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-2.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
            {children}
        </span>
    )
}

export function BannersBlock({ block }: BannersProps) {
    const blockData = isRecord(block.data) ? block.data : {}

    const variant = getBannerVariant(blockData.variant)
    const badge = typeof blockData.badge === 'string' ? blockData.badge.trim() : ''
    const title = typeof blockData.title === 'string' ? blockData.title : block.template.title
    const description = typeof blockData.description === 'string' ? blockData.description : ''

    if (variant === 'banner-01') {
        return (
            <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-12 text-primary-foreground shadow-md">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary-foreground/40" />
                    <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-primary-foreground/25" />
                    <div className="absolute top-10 right-10 h-16 w-16 rounded-full bg-primary-foreground/25" />
                </div>

                <div className="relative mx-auto max-w-3xl text-center">
                    <div className="space-y-4">
                        {badge ? (
                            <div className="flex justify-center">
                                <BannerPillOnGradient>{badge}</BannerPillOnGradient>
                            </div>
                        ) : null}

                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>

                        {description ? (
                            <p className="text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
                                {description}
                            </p>
                        ) : null}

                        <div className="pt-2">
                            <Button asChild size="lg" variant="secondary" className="text-primary">
                                <Link href="/catalog">Перейти в каталог</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (variant === 'banner-02') {
        return (
            <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-muted via-background to-muted px-6 py-10 shadow-md">
                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute -top-10 -left-10 h-36 w-36 rounded-full bg-secondary/30" />
                    <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-primary/20" />
                </div>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        {badge ? <BannerPill>{badge}</BannerPill> : null}
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h2>
                        {description ? (
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <Button asChild size="lg" className="shrink-0">
                        <Link href="/catalog">Перейти в каталог</Link>
                    </Button>
                </div>
            </section>
        )
    }

    if (variant === 'banner-03') {
        return (
            <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary via-secondary to-primary p-0.5 shadow-md">
                <div className="relative rounded-[calc(var(--radius-2xl)-2px)] bg-background px-6 py-10">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10" />
                    <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-secondary/10" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            {badge ? <BannerPill>{badge}</BannerPill> : null}
                            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                {title}
                            </h2>
                            {description ? (
                                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            ) : null}
                        </div>

                        <Button asChild variant="outline" className="shrink-0">
                            <Link href="/catalog">Перейти в каталог</Link>
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    return null
}
