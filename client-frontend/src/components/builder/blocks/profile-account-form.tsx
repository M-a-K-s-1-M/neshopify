'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockInstanceDto } from "@/lib/types";

interface FieldConfig {
    label?: string;
    type?: string;
    placeholder?: string;
}

interface ActionConfig {
    label?: string;
    variant?: "default" | "outline" | string;
}

export function ProfileAccountFormBlock({ block }: { block: BlockInstanceDto }) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const description = typeof data.description === "string" ? data.description : undefined;
    const fields = Array.isArray(data.fields) ? (data.fields as FieldConfig[]) : [];
    const actions = Array.isArray(data.actions) ? (data.actions as ActionConfig[]) : [];

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {description ? <p className="text-muted-foreground">{description}</p> : null}
            </div>

            <Card className="space-y-4 p-6">
                {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Добавьте поля в настройках блока.</p>
                ) : null}
                {fields.map((field, index) => (
                    <div key={`${field.label ?? "field"}-${index}`} className="space-y-2">
                        <Label className="text-sm font-medium">
                            {field.label ?? `Поле ${index + 1}`}
                        </Label>
                        <Input
                            readOnly
                            type={field.type ?? "text"}
                            placeholder={field.placeholder ?? "Заполните поле"}
                        />
                    </div>
                ))}

                {actions.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                        {actions.map((action, index) => (
                            <Button
                                key={`${action.label ?? "action"}-${index}`}
                                variant={action.variant === "outline" ? "outline" : "default"}
                                type="button"
                                className="min-w-[180px]"
                            >
                                {action.label ?? "Действие"}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </Card>
        </section>
    );
}
