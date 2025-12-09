import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlockInstanceDto } from "@/lib/types";

interface FallbackBlockProps {
    block: BlockInstanceDto;
}

export function FallbackBlock({ block }: FallbackBlockProps) {
    return (
        <Card className="border-dashed bg-muted/40">
            <CardHeader>
                <CardTitle>{block.template.title}</CardTitle>
                <CardDescription>
                    Компонент "{block.template.key}" пока не поддержан на клиенте. Данные блока будут сохранены и появятся после добавления нового шаблона.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
