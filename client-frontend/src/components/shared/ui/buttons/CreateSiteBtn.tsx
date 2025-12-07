import { Button } from "@/components";
import { Plus } from "lucide-react";

export function CreateSiteBtn() {
    return (
        <Button variant={'default'} className="cursor-pointer shadow-md" >
            <Plus />
            Создать сайт
        </Button>
    )
}
