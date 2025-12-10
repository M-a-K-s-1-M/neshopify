'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BlockInstanceDto } from "@/lib/types";

interface CartItemRow {
    name?: string;
    sku?: string;
    quantity?: number;
    price?: number;
    currency?: string;
}

interface CartSummary {
    total?: number;
    currency?: string;
    description?: string;
}

interface CartAction {
    label?: string;
    variant?: "default" | "outline" | string;
}

export function CartItemsListBlock({ block }: { block: BlockInstanceDto }) {
    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const note = typeof data.note === "string" ? data.note : undefined;
    const items = Array.isArray(data.items) ? (data.items as CartItemRow[]) : [];
    const summary = (data.summary as CartSummary | undefined) ?? {};
    const actions = Array.isArray(data.actions) ? (data.actions as CartAction[]) : [];

    const formattedTotal = typeof summary.total === "number"
        ? `${summary.total.toLocaleString("ru-RU")} ${summary.currency ?? "RUB"}`
        : null;

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {note ? <p className="text-muted-foreground">{note}</p> : null}
            </div>

            <Card className="p-4">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Корзина пуста.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Товар</TableHead>
                                <TableHead>Артикул</TableHead>
                                <TableHead>Количество</TableHead>
                                <TableHead className="text-right">Цена</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={`${item.sku ?? "row"}-${index}`}>
                                    <TableCell className="font-medium">{item.name ?? "Товар"}</TableCell>
                                    <TableCell>{item.sku ?? "—"}</TableCell>
                                    <TableCell>{item.quantity ?? 1}</TableCell>
                                    <TableCell className="text-right">
                                        {typeof item.price === "number"
                                            ? `${item.price.toLocaleString("ru-RU")} ${item.currency ?? "RUB"}`
                                            : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Итого</p>
                    <p className="text-2xl font-semibold">{formattedTotal ?? "—"}</p>
                    {summary.description ? (
                        <p className="text-xs text-muted-foreground">{summary.description}</p>
                    ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                    {actions.map((action, index) => (
                        <Button
                            key={`${action.label ?? "action"}-${index}`}
                            variant={action.variant === "outline" ? "outline" : "default"}
                            type="button"
                        >
                            {action.label ?? "Оформить"}
                        </Button>
                    ))}
                </div>
            </Card>
        </section>
    );
}
