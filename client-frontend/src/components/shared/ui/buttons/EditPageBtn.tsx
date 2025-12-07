'use client'

import { Button } from "@/components"
import { Edit } from "lucide-react"
import Link from "next/link"

export function EditPageBtn() {
    return (
        <Button variant={'ghost'} asChild>
            <Link href={'/sites/1/builder/home'}>
                <Edit />
                Редактировать страницу
            </Link>
        </Button>
    )
}
