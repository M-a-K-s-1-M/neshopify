'use client'

import { Button } from "@/components";
import { Edit } from "lucide-react";
import Link from "next/link";

interface EditPageBtnProps {
    href: string;
    label?: string;
}

export function EditPageBtn({ href, label = "Редактировать страницу" }: EditPageBtnProps) {
    return (
        <Button variant={'ghost'} asChild>
            <Link href={href}>
                <Edit />
                {label}
            </Link>
        </Button>
    );
}
