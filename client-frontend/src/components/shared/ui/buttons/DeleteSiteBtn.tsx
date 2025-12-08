'use client'

import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

export function DeleteSiteBtn({ siteId, className }: { siteId: string, className?: string }) {
    return (
        <Button variant={'destructive'} className={cn(className)}>
            <Trash2 />
            Удалить
        </Button>
    )
}
