'use client'

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { BlockInstanceDto } from "@/lib/types";

interface HeaderNavBasicProps {
    block: BlockInstanceDto;
}

export function HeaderNavBasicBlock({ block }: HeaderNavBasicProps) {
    const data = block.data ?? {};
    const links = Array.isArray(data.links) ? data.links : [];
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const logo = typeof data.logo === 'string' ? data.logo : block.template.title;
    const sticky = Boolean(data.sticky);

    return (
        <header className={`w-full ${sticky ? "sticky top-4 z-20" : "relative"}`}>
            <div className="rounded-2xl border bg-card/70 backdrop-blur px-6 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link href="/" className="font-semibold text-lg tracking-tight">
                        {logo}
                    </Link>
                    <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {links.map((link: any) => (
                            <Link
                                key={`${link.href}-${link.label}`}
                                href={(link?.href as string) ?? "#"}
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
                                <Link href={(action?.href as string) ?? "#"}>{action?.label ?? "Действие"}</Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <Separator className="mt-4" />
        </header>
    );
}
