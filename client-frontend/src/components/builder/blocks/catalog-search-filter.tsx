'use client'

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BlockInstanceDto } from "@/lib/types";

interface CatalogSearchFilterProps {
    block: BlockInstanceDto;
}

export function CatalogSearchFilterBlock({ block }: CatalogSearchFilterProps) {
    const data = block.data ?? {};
    const placeholder = typeof data.placeholder === 'string' ? data.placeholder : 'Поиск товаров';
    const allowCategory = data.allowCategoryFilter !== false;
    const allowPrice = data.allowPriceFilter !== false;
    const featuredCategories = Array.isArray(data.featuredCategories) ? data.featuredCategories : [];
    const priceRange = data.priceRange as { min?: number; max?: number } | undefined;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Фильтры каталога</CardTitle>
                <CardDescription>
                    Покупатели могут искать товары и быстро переключаться между категориями.
                </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
                <form className="space-y-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Поиск</FieldLabel>
                            <Input placeholder={placeholder} className="w-full" />
                        </Field>

                        {allowCategory && (
                            <Field>
                                <FieldLabel>Категории</FieldLabel>
                                <div className="flex flex-wrap gap-2">
                                    {featuredCategories.length > 0 ? (
                                        featuredCategories.map((cat: any) => (
                                            <Button key={cat} variant="outline" size="sm" type="button">
                                                {cat}
                                            </Button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Добавьте избранные категории в настройках блока.
                                        </p>
                                    )}
                                </div>
                            </Field>
                        )}

                        {allowPrice && (
                            <Field>
                                <FieldLabel>Цена</FieldLabel>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Input placeholder={`от ${priceRange?.min ?? 0}`} type="number" />
                                    <Input placeholder={`до ${priceRange?.max ?? 0}`} type="number" />
                                </div>
                            </Field>
                        )}
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button type="button" variant="secondary">
                            Применить фильтры
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
}
