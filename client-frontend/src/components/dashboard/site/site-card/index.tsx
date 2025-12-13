'use client';

import Link from "next/link";
import { Component, Edit, Link as LinkIcon } from "lucide-react";

import {
    ActionsSiteBtn,
    Button,
    ButtonGroup,
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Separator,
} from "@/components";
import type { SiteDto, SiteStatus } from "@/lib/types";

interface SiteCardProps {
    site: SiteDto;
}

const STATUS_LABELS: Record<SiteStatus, string> = {
    DRAFT: "Черновик",
    PUBLISHED: "Опубликован",
    ARCHIVED: "Архив",
};

const STATUS_STYLES: Record<SiteStatus, string> = {
    DRAFT: "bg-amber-100 text-amber-900",
    PUBLISHED: "bg-emerald-100 text-emerald-900",
    ARCHIVED: "bg-slate-200 text-slate-600",
};

export function SiteCard({ site }: SiteCardProps) {
    const dashboardHref = `/sites/${site.id}`;
    const builderHref = `/sites/${site.id}/builder/home`;
    const publicHref = site.domain ? `https://${site.domain}` : null;
    const domainLabel = site.domain ?? `${site.slug}.cosmiq.store`;

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="mb-2">
                <CardTitle className="flex items-center justify-between gap-3 text-xl">
                    <span>{site.name}</span>
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[site.status]}`}
                    >
                        {STATUS_LABELS[site.status]}
                    </span>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    {domainLabel}
                </CardDescription>
                <CardAction>
                    <ActionsSiteBtn siteId={site.id} />
                </CardAction>
            </CardHeader>

            <Separator />

            <CardFooter>
                <div className="flex flex-wrap items-center justify-between w-full gap-3">
                    <ButtonGroup className="bg-linear-to-r from-primary to-secondary rounded-md">
                        <Button variant={'ghost'} size={'sm'} asChild>
                            <Link href={dashboardHref}>
                                <Edit className="h-4 w-4" />
                                Управление
                            </Link>
                        </Button>
                        <Button variant={'ghost'} size={'sm'} asChild>
                            <Link href={builderHref}>
                                Конструктор
                                <Component className="h-4 w-4" />
                            </Link>
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup>
                        <Button
                            variant={'ghost'}
                            size={'sm'}
                            className="cursor-pointer"
                            disabled={!publicHref}
                            asChild={Boolean(publicHref)}
                        >
                            {publicHref ? (
                                <Link href={publicHref} target="_blank" rel="noreferrer">
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    {domainLabel}
                                </Link>
                            ) : (
                                <span className="inline-flex items-center text-muted-foreground">
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    {domainLabel}
                                </span>
                            )}
                        </Button>
                    </ButtonGroup>
                </div>
            </CardFooter>
        </Card>
    );
}
