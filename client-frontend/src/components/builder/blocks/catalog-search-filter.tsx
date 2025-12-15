'use client'

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BlockInstanceDto } from "@/lib/types";
import { CategoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/keys";
import { useCatalogFiltersOptional } from "../catalog-filters-context";

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
    const [searchText, setSearchText] = useState('');
    const [priceMinInput, setPriceMinInput] = useState('');
    const [priceMaxInput, setPriceMaxInput] = useState('');

    const catalogFilters = useCatalogFiltersOptional();

    useEffect(() => {
        if (!catalogFilters) return;
        const unregister = catalogFilters.registerFiltersUi();
        return unregister;
    }, [catalogFilters]);

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

    const parseOptionalNumber = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return undefined;
        const value = Number(trimmed);
        return Number.isFinite(value) ? value : undefined;
    };

    const categoryTriggerMeta = useMemo(() => {
        if (!allowCategory || resolvedFeatured.length === 0) {
            return null;
        }

        const total = resolvedFeatured.length;
        const selected = selectedCategoryIds.length;

        if (selected === 0 || selected === total) {
            return "";
        }

        return String(selected);
    }, [allowCategory, resolvedFeatured.length, selectedCategoryIds.length]);

    const priceTriggerMeta = useMemo(() => {
        if (!allowPrice) {
            return null;
        }

        const min = parseOptionalNumber(priceMinInput);
        const max = parseOptionalNumber(priceMaxInput);

        if (min == null && max == null) {
            return "";
        }

        if (min != null && max != null) {
            return `${min}–${max}`;
        }

        if (min != null) {
            return `от ${min}`;
        }

        return `до ${max}`;
    }, [allowPrice, priceMinInput, priceMaxInput]);

    useEffect(() => {
        if (!catalogFilters) return;

        const timeout = setTimeout(() => {
            catalogFilters.setFilters({
                search: searchText.trim() ? searchText.trim() : undefined,
                categoryIds: allowCategory ? selectedCategoryIds : undefined,
                priceMin: allowPrice ? parseOptionalNumber(priceMinInput) : undefined,
                priceMax: allowPrice ? parseOptionalNumber(priceMaxInput) : undefined,
            });
        }, 250);

        return () => clearTimeout(timeout);
    }, [
        catalogFilters,
        searchText,
        allowCategory,
        selectedCategoryIds,
        allowPrice,
        priceMinInput,
        priceMaxInput,
    ]);

    return (
        <div className="w-full rounded-2xl bg-card p-3 shadow-md">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex-1">
                    <Input
                        placeholder={placeholder}
                        className="h-10 w-full"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                {allowCategory ? (
                    resolvedFeatured.length === 0 ? (
                        <Button type="button" variant="outline" className="h-10 w-full justify-between md:w-[220px]" disabled>
                            Категория
                        </Button>
                    ) : (
                        <Popover open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" className="h-10 w-full justify-between md:w-[220px]">
                                    Категория
                                    {categoryTriggerMeta ? (
                                        <span className="text-muted-foreground text-xs">{categoryTriggerMeta}</span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">&nbsp;</span>
                                    )}
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
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setCategoryDropdownOpen(false)}
                                        >
                                            Готово
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )
                ) : null}

                {allowPrice ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="h-10 w-full justify-between md:w-[180px]">
                                Цена
                                {priceTriggerMeta ? (
                                    <span className="text-muted-foreground text-xs">{priceTriggerMeta}</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">&nbsp;</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="start">
                            <div className="space-y-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                        placeholder={`от ${priceRange?.min ?? 0}`}
                                        type="number"
                                        value={priceMinInput}
                                        onChange={(e) => setPriceMinInput(e.target.value)}
                                    />
                                    <Input
                                        placeholder={`до ${priceRange?.max ?? 0}`}
                                        type="number"
                                        value={priceMaxInput}
                                        onChange={(e) => setPriceMaxInput(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setPriceMinInput('');
                                            setPriceMaxInput('');
                                        }}
                                    >
                                        Сбросить
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : null}
            </div>
        </div>
    );
}
