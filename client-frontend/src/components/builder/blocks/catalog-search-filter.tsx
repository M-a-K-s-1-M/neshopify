'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BlockInstanceDto } from "@/lib/types";
import { CategoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/keys";

interface CatalogSearchFilterProps {
    block: BlockInstanceDto;
    siteId: string;
}

export function CatalogSearchFilterBlock({ block, siteId }: CatalogSearchFilterProps) {
    const data = block.data ?? {};
    const placeholder = typeof data.placeholder === 'string' ? data.placeholder : 'Поиск товаров';
    const allowCategory = data.allowCategoryFilter !== false;
    const allowPrice = data.allowPriceFilter !== false;
    const featuredCategories = Array.isArray(data.featuredCategories) ? data.featuredCategories : [];
    const priceRange = data.priceRange as { min?: number; max?: number } | undefined;

    const { data: categories = [] } = useQuery({
        queryKey: queryKeys.siteCategories(siteId),
        queryFn: () => CategoriesApi.list(siteId),
        staleTime: 60 * 1000,
    });

    const resolvedFeatured = featuredCategories
        .map((item: any) => {
            if (typeof item !== 'string') {
                return null;
            }
            const byId = categories.find((c) => c.id === item);
            if (byId) return { id: byId.id, name: byId.name };
            const bySlug = categories.find((c) => c.slug === item);
            if (bySlug) return { id: bySlug.id, name: bySlug.name };
            const byName = categories.find((c) => c.name === item);
            if (byName) return { id: byName.id, name: byName.name };
            return { id: item, name: item };
        })
        .filter(Boolean) as Array<{ id: string; name: string }>;

    const [categorySearch, setCategorySearch] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    useEffect(() => {
        // По умолчанию выбираем всё, что настроено как "избранные категории".
        setSelectedCategoryIds(resolvedFeatured.map((c) => c.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedFeatured.map((c) => c.id).join('|')]);

    const selectedSet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds]);

    const filteredCategoryOptions = useMemo(() => {
        const q = categorySearch.trim().toLowerCase();
        if (!q) return resolvedFeatured;
        return resolvedFeatured.filter((c) => c.name.toLowerCase().includes(q));
    }, [resolvedFeatured, categorySearch]);

    const toggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return Array.from(next);
        });
    };

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
                                {resolvedFeatured.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Добавьте категории в настройках блока.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        <Popover open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="outline" className="w-full justify-between">
                                                    Выбрать категории
                                                    <span className="text-muted-foreground text-xs">{selectedCategoryIds.length}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-3" align="start">
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder="Поиск категории"
                                                        value={categorySearch}
                                                        onChange={(event) => setCategorySearch(event.target.value)}
                                                    />

                                                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                                                        {filteredCategoryOptions.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
                                                        ) : (
                                                            filteredCategoryOptions.map((cat) => {
                                                                const checked = selectedSet.has(cat.id);
                                                                return (
                                                                    <label
                                                                        key={cat.id}
                                                                        className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-muted/40"
                                                                    >
                                                                        <span className="text-sm text-muted-foreground">{cat.name}</span>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={() => toggleCategory(cat.id)}
                                                                            className="h-4 w-4 rounded border-border"
                                                                        />
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <Button type="button" variant="secondary" size="sm" onClick={() => setCategoryDropdownOpen(false)}>
                                                            Готово
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
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
