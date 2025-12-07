'use client'

import { Button } from "@/components/ui";
import { Settings } from "lucide-react";
import Link from "next/link";

export function SettingsSiteBtn({ href }: { href: string }) {
    return (
        <Button variant={'default'} asChild>
            <Link href={href}>
                <Settings />
                Настройки сайта
            </Link>
        </Button>
    )
}
