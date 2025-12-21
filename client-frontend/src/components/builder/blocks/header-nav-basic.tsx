'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { BlockInstanceDto } from "@/lib/types";
import { resolveSiteHref, useSiteBasePath } from "@/components/providers/site-base-path-provider";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

function extractStoreSiteId(basePath: string) {
    // Preview route: /preview/sites/:siteId/...
    const previewMatch = basePath.match(/^\/preview\/sites\/([^/]+)(?:\/|$)/);
    if (previewMatch?.[1]) return previewMatch[1];

    // Published route: /:siteId(uuid)/:siteSlug/...
    const publishedMatch = basePath.match(
        /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/[^/]+)?(?:\/|$)/i
    );
    if (publishedMatch?.[1]) return publishedMatch[1];

    return null;
}

function buildAuthHref({ baseAuthPath, basePath, returnTo }: { baseAuthPath: string; basePath: string; returnTo: string }) {
    const params = new URLSearchParams();
    params.set('returnTo', returnTo);

    const siteId = extractStoreSiteId(basePath);
    if (siteId) params.set('siteId', siteId);

    return params.toString() ? `${baseAuthPath}?${params.toString()}` : baseAuthPath;
}

function isCustomerForCurrentStore(user: any, siteId: string | null) {
    if (!user || !siteId) return false;
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    return roles.includes('CUSTOMER') && user.siteId === siteId;
}

interface HeaderNavBasicProps {
    block: BlockInstanceDto;
}

export function HeaderNavBasicBlock({ block }: HeaderNavBasicProps) {
    const basePath = useSiteBasePath();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const data = block.data ?? {};
    const links = Array.isArray(data.links) ? data.links : [];
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const logo = typeof data.logo === 'string' ? data.logo : block.template.title;
    const sticky = Boolean(data.sticky);

    const storeSiteId = extractStoreSiteId(basePath);
    const inStoreContext = Boolean(storeSiteId);
    const isStoreAuthed = isCustomerForCurrentStore(user, storeSiteId);

    const returnTo = useMemo(() => {
        const query = searchParams.toString();
        return query ? `${pathname}?${query}` : pathname;
    }, [pathname, searchParams]);

    return (
        <header className={`w-full ${sticky ? "sticky top-0 z-20" : "relative"}`}>
            <div className="bg-card px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link href={resolveSiteHref("/", basePath)} className="font-semibold text-lg tracking-tight">
                        {logo}
                    </Link>
                    <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {links.map((link: any) => (
                            <Link
                                key={`${link.href}-${link.label}`}
                                href={resolveSiteHref((link?.href as string) ?? "#", basePath)}
                                className={`transition-colors hover:text-foreground ${link?.active ? "text-foreground font-medium" : ""}`}
                            >
                                {link?.label ?? "Ссылка"}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        {inStoreContext ? (
                            isStoreAuthed ? (
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={async () => {
                                        await logout();
                                        // остаемся в магазине, пусть пользователю снова покажется "Войти"
                                        window.location.href = returnTo;
                                    }}
                                >
                                    Выйти
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="sm" variant="default">
                                        <Link href={`${basePath}/auth?${new URLSearchParams({ returnTo }).toString()}`}>Войти</Link>
                                    </Button>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`${basePath}/auth/register?${new URLSearchParams({ returnTo }).toString()}`}>Регистрация</Link>
                                    </Button>
                                </>
                            )
                        ) : (
                            actions.map((action: any) => (
                                <Button
                                    key={`${action.href}-${action.label}`}
                                    asChild
                                    size="sm"
                                    variant={action?.variant === "ghost" ? "ghost" : "default"}
                                >
                                    <Link
                                        href={(() => {
                                            const href = typeof action?.href === 'string' ? action.href : '#';
                                            if (href.startsWith('/auth')) {
                                                return buildAuthHref({ baseAuthPath: href, basePath, returnTo });
                                            }
                                            return resolveSiteHref(href, basePath);
                                        })()}
                                    >
                                        {action?.label ?? "Действие"}
                                    </Link>
                                </Button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
