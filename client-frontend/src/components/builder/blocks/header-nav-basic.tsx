'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { BlockInstanceDto } from "@/lib/types";
import { resolveSiteHref, useSiteBasePath } from "@/components/providers/site-base-path-provider";

interface HeaderNavBasicProps {
    block: BlockInstanceDto;
}

export function HeaderNavBasicBlock({ block }: HeaderNavBasicProps) {
    const basePath = useSiteBasePath();
    const data = block.data ?? {};
    const links = Array.isArray(data.links) ? data.links : [];
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const logo = typeof data.logo === 'string' ? data.logo : block.template.title;
    const sticky = Boolean(data.sticky);

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
                        {actions.map((action: any) => (
                            <Button
                                key={`${action.href}-${action.label}`}
                                asChild
                                size="sm"
                                variant={action?.variant === "ghost" ? "ghost" : "default"}
                            >
                                <Link href={resolveSiteHref((action?.href as string) ?? "#", basePath)}>{action?.label ?? "Действие"}</Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
