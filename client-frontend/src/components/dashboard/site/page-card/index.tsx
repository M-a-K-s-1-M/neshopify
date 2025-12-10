'use client';

import {
    DeletePageBtn,
    EditPageBtn,
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components";
import type { PageDto } from "@/lib/types";

interface PageCardProps {
    page: PageDto;
    siteId: string;
}

export function PageCard({ page, siteId }: PageCardProps) {
    const builderHref = `/sites/${siteId}/builder/${page.slug}`;
    const isViewOnly = page.type === "PROFILE" || page.type === "CART";
    const updatedLabel = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(page.updatedAt));

    return (
        <Item variant={'muted'} className="shadow-md">
            <ItemContent>
                <ItemTitle>{page.title}</ItemTitle>
            </ItemContent>

            <ItemContent>
                <ItemDescription>
                    <span className="font-mono text-xs uppercase text-muted-foreground mr-2">/{page.slug}</span>
                    <span className="text-sm text-muted-foreground">Обновлено {updatedLabel}</span>
                </ItemDescription>
            </ItemContent>

            <ItemActions className="md:border-l">
                <EditPageBtn href={builderHref} label={isViewOnly ? "Просмотреть" : undefined} />
                {!isViewOnly ? <DeletePageBtn siteId={siteId} pageId={page.id} /> : null}
            </ItemActions>
        </Item>
    );
}
