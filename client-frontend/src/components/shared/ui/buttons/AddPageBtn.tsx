'use client';

import { Button } from "@/components";
import { Plus } from "lucide-react";

export function AddPageBtn() {
    return (
        <Button variant={'outline'}>
            <Plus />
            Добавить страницу
        </Button>
    )
}
