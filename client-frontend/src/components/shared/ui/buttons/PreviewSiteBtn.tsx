'use client'

import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function PreviewSiteBtn({
    href,
    className,
    label = "Предпросмотр",
    newTab = false,
    onClick,
}: {
    href: string;
    className?: string;
    label?: string;
    newTab?: boolean;
    onClick?: () => void;
}) {
    if (onClick) {
        return (
            <Button type="button" variant={'outline'} className={cn(className)} onClick={onClick}>
                <Eye />
                {label}
            </Button>
        );
    }

    return (
        <Button variant={'outline'} asChild className={cn(className)}>
            <Link
                href={href}
                target={newTab ? "_blank" : undefined}
                rel={newTab ? "noreferrer" : undefined}
            >
                <Eye />
                {label}
            </Link>
        </Button>
    );
}
