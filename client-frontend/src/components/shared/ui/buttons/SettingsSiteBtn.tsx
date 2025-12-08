'use client'

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";

export function SettingsSiteBtn({ href, className }: { href: string, className?: string }) {

    return (
        <Button variant={'default'} asChild className={cn(className)}>
            <Link href={href}>
                <Settings />
                Настройки сайта
            </Link>
        </Button>
    )
}
