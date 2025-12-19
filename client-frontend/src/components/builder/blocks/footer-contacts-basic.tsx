'use client'

import { Separator } from "@/components/ui/separator";
import type { BlockInstanceDto } from "@/lib/types";
import Link from "next/link";
import { resolveSiteHref, useSiteBasePath } from "@/components/providers/site-base-path-provider";

interface FooterContactsBlockProps {
    block: BlockInstanceDto;
}

export function FooterContactsBlock({ block }: FooterContactsBlockProps) {
    const basePath = useSiteBasePath();
    const data = block.data ?? {};
    const brand = typeof data.brand === 'string' ? data.brand : block.template.title;
    const description = typeof data.description === 'string' ? data.description : undefined;
    const links = Array.isArray(data.links) ? data.links : [];
    const contacts = Array.isArray(data.contacts) ? data.contacts : [];
    const legal = typeof data.legal === 'string' ? data.legal : undefined;

    return (
        <footer className="w-full bg-card px-6 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                <div className="space-y-2">
                    <p className="text-lg font-semibold">{brand}</p>
                    {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
                    {legal && <p className="text-xs text-muted-foreground">{legal}</p>}
                </div>

                <div className="flex flex-col gap-4 text-sm">
                    <div>
                        <p className="font-medium mb-2">Страницы</p>
                        <ul className="space-y-1 text-muted-foreground">
                            {links.map((link: any) => (
                                <li key={`${link.href}-${link.label}`}>
                                    <Link href={resolveSiteHref((link?.href as string) ?? '#', basePath)} className="hover:text-foreground">
                                        {link?.label ?? 'Ссылка'}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Контакты</p>
                        <ul className="space-y-1 text-muted-foreground">
                            {contacts.map((contact: any, index: number) => (
                                <li key={`${contact?.value ?? index}`}>
                                    {contact?.type ? `${contact.type}: ` : null}
                                    <span className="text-foreground">{contact?.value ?? '—'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">Собрано в Cosmiq Builder</p>
        </footer>
    );
}
