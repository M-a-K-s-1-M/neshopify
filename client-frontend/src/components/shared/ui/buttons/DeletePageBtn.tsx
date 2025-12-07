import { Button } from "@/components";
import { Trash2 } from "lucide-react";

export function DeletePageBtn() {
    return (
        <Button variant={'ghost'}>
            <Trash2 />
            Удалить
        </Button>
    )
}
