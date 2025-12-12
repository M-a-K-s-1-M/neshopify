
'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { Button, Input, Label } from "@/components";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { SitePageView } from "./site-page-view";
import { useSiteQuery } from "@/lib/query/hooks";
import { queryKeys } from "@/lib/query/keys";
import { ProductsApi } from "@/lib/api/products";
import { CategoriesApi } from "@/lib/api/categories";
import { ProductMediaApi } from "@/lib/api/product-media";
import type {
    CreateProductPayload,
    PaginatedResponse,
    ProductCategoryDto,
    ProductDto,
} from "@/lib/types";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/utils/media";
import Image from "next/image";
import type { ProductMediaDto } from "@/lib/types";

interface CatalogWorkspaceProps {
    siteId: string;
}

const DEFAULT_FORM = {
    title: "",
    description: "",
    price: "",
    stock: "0",
    categoryId: "",
};

const PAGE_SIZE = 10;

export function CatalogWorkspace({ siteId }: CatalogWorkspaceProps) {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedProductSnapshot, setSelectedProductSnapshot] = useState<ProductDto | null>(null);
    const [formState, setFormState] = useState(() => ({ ...DEFAULT_FORM }));
    const [formError, setFormError] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const mediaInputRef = useRef<HTMLInputElement | null>(null);

    const { data: site } = useSiteQuery(siteId);
    const activeSearch = search || undefined;

    const {
        data: productPage,
        isLoading: productsLoading,
        isFetching: productsFetching,
        error: productsError,
    } = useQuery({
        queryKey: queryKeys.siteProductsList(siteId, page, activeSearch, PAGE_SIZE),
        queryFn: () => ProductsApi.list(siteId, { page, limit: PAGE_SIZE, search: activeSearch }),
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: queryKeys.siteCategories(siteId),
        queryFn: () => CategoriesApi.list(siteId),
        staleTime: 60 * 1000,
    });

    const { data: selectedProductFull } = useQuery({
        queryKey: selectedProductId ? queryKeys.siteProduct(siteId, selectedProductId) : ["sites", siteId, "products", "__none__"],
        queryFn: () => ProductsApi.get(siteId, selectedProductId as string),
        enabled: Boolean(selectedProductId) && !isCreatingNew,
    });

    const products = productPage?.data ?? [];
    const paginationMeta = productPage?.meta;

    const categorySelectValue = formState.categoryId ? formState.categoryId : "__none__";

    useEffect(() => {
        if (isCreatingNew || selectedProductId) {
            return;
        }
        if (products.length > 0) {
            setSelectedProductId(products[0].id);
            setSelectedProductSnapshot(products[0]);
        }
    }, [isCreatingNew, selectedProductId, products]);

    useEffect(() => {
        if (!selectedProductId) {
            return;
        }
        const updated = products.find((product) => product.id === selectedProductId);
        if (updated) {
            setSelectedProductSnapshot(updated);
        }
    }, [products, selectedProductId]);

    useEffect(() => {
        if (!selectedProductFull) {
            return;
        }
        setSelectedProductSnapshot(selectedProductFull);
    }, [selectedProductFull]);

    useEffect(() => {
        if (isCreatingNew) {
            setFormState({ ...DEFAULT_FORM });
            setFormError(null);
            return;
        }
        if (selectedProductSnapshot) {
            setFormState({
                title: selectedProductSnapshot.title ?? "",
                description: selectedProductSnapshot.description ?? "",
                price: String(selectedProductSnapshot.price ?? ""),
                stock: String(selectedProductSnapshot.stock ?? 0),
                categoryId: selectedProductSnapshot.categoryId ?? "",
            });
            setFormError(null);
        }
    }, [isCreatingNew, selectedProductSnapshot]);

    const saveProductMutation = useMutation({
        mutationFn: async (params: { payload: CreateProductPayload; productId?: string }) => {
            if (params.productId) {
                return ProductsApi.update(siteId, params.productId, params.payload);
            }
            return ProductsApi.create(siteId, params.payload);
        },
        onSuccess: async (product, variables) => {
            setIsCreatingNew(false);
            setSelectedProductId(product.id);
            setSelectedProductSnapshot(product);
            setFormState({
                title: product.title ?? "",
                description: product.description ?? "",
                price: String(product.price ?? ""),
                stock: String(product.stock ?? 0),
                categoryId: product.categoryId ?? "",
            });
            syncProductListsAfterUpsert(queryClient, siteId, page, activeSearch, PAGE_SIZE, product, {
                isNew: !variables?.productId,
            });
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProducts(siteId) });
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось сохранить товар"));
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (productId: string) => ProductsApi.remove(siteId, productId),
        onSuccess: async (_, productId) => {
            if (productId) {
                syncProductListsAfterRemoval(queryClient, siteId, page, activeSearch, PAGE_SIZE, productId);
            }
            setSelectedProductId(null);
            setSelectedProductSnapshot(null);
            setIsCreatingNew(true);
            setFormState({ ...DEFAULT_FORM });
            setFormError(null);
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProducts(siteId) });
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось удалить товар"));
        },
    });

    const uploadMediaMutation = useMutation({
        mutationFn: async () => {
            if (!selectedProductId) {
                throw new Error("productId is required");
            }
            if (pendingFiles.length === 0) {
                return [];
            }
            return ProductMediaApi.upload(siteId, selectedProductId, pendingFiles);
        },
        onSuccess: async () => {
            setPendingFiles([]);
            if (mediaInputRef.current) {
                // Позволяет выбрать те же самые файлы повторно (иначе onChange может не сработать).
                mediaInputRef.current.value = "";
            }
            if (selectedProductId) {
                await queryClient.invalidateQueries({ queryKey: queryKeys.siteProduct(siteId, selectedProductId) });
            }
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProducts(siteId) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProductsList(siteId, page, activeSearch, PAGE_SIZE) });
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось загрузить фотографии"));
        },
    });

    const deleteMediaMutation = useMutation({
        mutationFn: async (media: ProductMediaDto) => {
            if (!selectedProductId) {
                throw new Error("productId is required");
            }
            await ProductMediaApi.remove(siteId, selectedProductId, media.id);
        },
        onMutate: async (media) => {
            if (!selectedProductId) {
                return { previous: null as ProductDto | null };
            }

            const key = queryKeys.siteProduct(siteId, selectedProductId);
            await queryClient.cancelQueries({ queryKey: key });

            const previous = queryClient.getQueryData<ProductDto>(key) ?? null;

            queryClient.setQueryData<ProductDto>(key, (current) => {
                if (!current) return current as any;
                const nextMedia = (current.media ?? []).filter((item) => item.id !== media.id);
                // Приведём order к 0..n-1, чтобы UI сразу выглядел консистентно.
                const normalized = nextMedia
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => ({ ...item, order: index }));
                return { ...current, media: normalized };
            });

            return { previous };
        },
        onError: (error, _media, ctx) => {
            if (selectedProductId && ctx?.previous) {
                queryClient.setQueryData(queryKeys.siteProduct(siteId, selectedProductId), ctx.previous);
            }
            window.alert(getRequestErrorMessage(error, "Не удалось удалить фотографию"));
        },
        onSuccess: async () => {
            if (selectedProductId) {
                await queryClient.invalidateQueries({ queryKey: queryKeys.siteProduct(siteId, selectedProductId) });
            }
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProducts(siteId) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.siteProductsList(siteId, page, activeSearch, PAGE_SIZE) });
        },
    });

    const maxPage = useMemo(() => {
        if (!paginationMeta) return 1;
        return Math.max(1, Math.ceil((paginationMeta.total ?? 0) / paginationMeta.limit));
    }, [paginationMeta]);

    const categoryOptions = useMemo(() => buildCategoryOptions(categories), [categories]);

    const productsErrorMessage = productsError
        ? getRequestErrorMessage(productsError, "Не удалось загрузить товары")
        : null;

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSearch(searchInput.trim());
        setPage(1);
    };

    const handleResetSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handlePageChange = (direction: "prev" | "next") => {
        setPage((current) => {
            const nextPage = direction === "next" ? current + 1 : current - 1;
            if (nextPage < 1 || (paginationMeta && nextPage > maxPage)) {
                return current;
            }
            return nextPage;
        });
    };

    const handleSelectProduct = (product: ProductDto) => {
        setIsCreatingNew(false);
        setSelectedProductId(product.id);
        setSelectedProductSnapshot(product);
    };

    const handleStartCreate = () => {
        setIsCreatingNew(true);
        setSelectedProductId(null);
        setSelectedProductSnapshot(null);
        setFormState({ ...DEFAULT_FORM });
        setFormError(null);
    };

    const handleChange = (field: keyof typeof DEFAULT_FORM, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const title = formState.title.trim();
        if (!title) {
            setFormError("Укажите название товара");
            return;
        }
        const priceValue = Number(formState.price);
        if (Number.isNaN(priceValue) || priceValue <= 0) {
            setFormError("Укажите цену больше нуля");
            return;
        }
        const stockValue = Math.max(0, Number(formState.stock) || 0);
        const payload: CreateProductPayload = {
            title,
            description: formState.description?.trim() || undefined,
            price: parseFloat(priceValue.toFixed(2)),
            currency: "RUB",
            stock: stockValue,
            stockStatus: stockValue > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
            categoryId: formState.categoryId || undefined,
        };

        const editingProductId = !isCreatingNew ? selectedProductId ?? null : null;
        if (!isCreatingNew && !editingProductId) {
            setFormError("Выберите товар для редактирования или создайте новый");
            return;
        }

        saveProductMutation.mutate({
            productId: editingProductId ?? undefined,
            payload,
        });
    };

    const isSaving = saveProductMutation.isPending;
    const isDeleting = deleteProductMutation.isPending;
    const isUploadingMedia = uploadMediaMutation.isPending;
    const isDeletingMedia = deleteMediaMutation.isPending;
    const isBusy = isSaving || isDeleting || isUploadingMedia || isDeletingMedia;
    const canSubmit = Boolean(formState.title.trim() && formState.price.trim()) && !isBusy;

    const handleDelete = () => {
        if (!selectedProductId || isCreatingNew) {
            return;
        }
        if (!window.confirm("Удалить этот товар?")) {
            return;
        }
        deleteProductMutation.mutate(selectedProductId);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Каталог</p>
                    <h1 className="text-2xl font-semibold">{site?.name ?? "Сайт"}</h1>
                    <p className="font-mono text-sm text-muted-foreground">/catalog</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{productsPageCount(productsLoading, paginationMeta)}</span>
                    <span>•</span>
                    <span>{isCreatingNew ? "Новый товар" : selectedProductSnapshot?.title ?? "Без выбора"}</span>
                </div>
            </div>

            {productsErrorMessage ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {productsErrorMessage}
                </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
                <aside className="space-y-4 rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Товары</h2>
                        <Button size="icon" variant="ghost" type="button" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.siteProducts(siteId) })}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Поиск"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                        />
                        <Button type="submit" size="sm">
                            Искать
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleResetSearch}>
                            Сбросить
                        </Button>
                    </form>
                    <Button type="button" className="w-full" variant="secondary" onClick={handleStartCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Новый товар
                    </Button>
                    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                        {productsLoading ? (
                            <p className="text-sm text-muted-foreground">Загрузка списка...</p>
                        ) : products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Добавьте первый товар, чтобы увидеть его в каталоге.</p>
                        ) : (
                            products.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-left text-sm",
                                        selectedProductId === product.id && !isCreatingNew
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/40",
                                    )}
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <p className="font-medium line-clamp-1">{product.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {Number(product.price).toLocaleString("ru-RU")} {product.currency}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            Стр. {paginationMeta?.page ?? 1} из {maxPage}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handlePageChange("prev")}
                                disabled={productsFetching || (paginationMeta?.page ?? 1) <= 1}
                            >
                                Назад
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handlePageChange("next")}
                                disabled={productsFetching || (paginationMeta?.page ?? 1) >= maxPage}
                            >
                                Далее
                            </Button>
                        </div>
                    </div>
                </aside>

                <section className="rounded-2xl border border-border bg-background p-4">
                    <SitePageView slug="catalog" title="Каталог" description="Предпросмотр страницы каталога" />
                </section>

                <aside className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{isCreatingNew ? "Новый товар" : "Редактирование"}</p>
                            <h2 className="text-lg font-semibold">
                                {isCreatingNew ? "Добавьте карточку" : selectedProductSnapshot?.title ?? "Выберите товар"}
                            </h2>
                        </div>
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                    </div>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="product-title">Название*</Label>
                            <Input
                                id="product-title"
                                placeholder="Например, Космическая худи"
                                value={formState.title}
                                onChange={(event) => handleChange("title", event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-description">Описание</Label>
                            <textarea
                                id="product-description"
                                className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                placeholder="Расскажите, почему этот товар особенный"
                                value={formState.description}
                                onChange={(event) => handleChange("description", event.target.value)}
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-price">Цена*</Label>
                                <Input
                                    id="product-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    inputMode="decimal"
                                    value={formState.price}
                                    onChange={(event) => handleChange("price", event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-stock">Количество</Label>
                                <Input
                                    id="product-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    value={formState.stock}
                                    onChange={(event) => handleChange("stock", event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-category">Категория</Label>
                            <Select
                                value={categorySelectValue}
                                onValueChange={(value) => {
                                    handleChange("categoryId", value === "__none__" ? "" : value);
                                }}
                                disabled={categoriesLoading}
                            >
                                <SelectTrigger id="product-category" className="w-full">
                                    <SelectValue placeholder="Без категории" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Без категории</SelectItem>
                                    {categoryOptions.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-media">Фотографии</Label>
                            {selectedProductSnapshot?.media?.length ? (
                                <div className="space-y-2">
                                    {selectedProductSnapshot.media
                                        .slice()
                                        .sort((a, b) => a.order - b.order)
                                        .map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                                                    <Image
                                                        src={resolveMediaUrl(item.url)}
                                                        alt={item.alt ?? selectedProductSnapshot.title}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium line-clamp-1">{item.alt ?? "Фото"}</p>
                                                    <p className="text-xs text-muted-foreground">Порядок: {item.order}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    disabled={!selectedProductId || isCreatingNew || isBusy}
                                                    onClick={() => {
                                                        if (!window.confirm("Удалить эту фотографию?")) return;
                                                        deleteMediaMutation.mutate(item);
                                                    }}
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">Фотографий пока нет.</p>
                            )}

                            <Input
                                id="product-media"
                                type="file"
                                accept="image/*"
                                multiple
                                ref={mediaInputRef}
                                disabled={!selectedProductId || isCreatingNew || isBusy}
                                onClick={(event) => {
                                    // На некоторых браузерах выбор того же файла не триггерит onChange.
                                    // Очищаем значение перед выбором.
                                    (event.currentTarget as HTMLInputElement).value = "";
                                }}
                                onChange={(event) => {
                                    const list = Array.from(event.target.files ?? []);
                                    setPendingFiles(list);
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                disabled={!selectedProductId || isCreatingNew || pendingFiles.length === 0 || isBusy}
                                onClick={() => uploadMediaMutation.mutate()}
                            >
                                {isUploadingMedia ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Загружаем
                                    </span>
                                ) : (
                                    `Загрузить (${pendingFiles.length || 0})`
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Сначала сохраните товар, затем загрузите фото.
                            </p>
                        </div>

                        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                        <Button type="submit" className="w-full" disabled={!canSubmit}>
                            {isSaving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Сохраняем
                                </span>
                            ) : isCreatingNew ? (
                                "Создать товар"
                            ) : (
                                "Сохранить изменения"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full"
                            disabled={isCreatingNew || !selectedProductId || isBusy}
                            onClick={handleDelete}
                        >
                            {isDeleting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Удаляем
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Trash2 className="h-4 w-4" /> Удалить товар
                                </span>
                            )}
                        </Button>
                    </form>
                </aside>
            </div>
        </div>
    );
}

type ProductListCache = PaginatedResponse<ProductDto> | undefined;

function syncProductListsAfterUpsert(
    queryClient: QueryClient,
    siteId: string,
    page: number,
    search: string | undefined,
    limit: number,
    product: ProductDto,
    options: { isNew: boolean },
) {
    const targets = buildProductListTargets(siteId, page, search, limit);
    const seen = new Set<string>();
    targets.forEach((target) => {
        const keyId = JSON.stringify(target.key);
        if (seen.has(keyId)) {
            return;
        }
        seen.add(keyId);
        queryClient.setQueryData(target.key, (cached: ProductListCache) =>
            upsertProductInCache(cached, product, { allowInsert: target.allowInsert, isNew: options.isNew }),
        );
    });
}

function syncProductListsAfterRemoval(
    queryClient: QueryClient,
    siteId: string,
    page: number,
    search: string | undefined,
    limit: number,
    productId: string,
) {
    const targets = buildProductListTargets(siteId, page, search, limit);
    const seen = new Set<string>();
    targets.forEach((target) => {
        const keyId = JSON.stringify(target.key);
        if (seen.has(keyId)) {
            return;
        }
        seen.add(keyId);
        queryClient.setQueryData(target.key, (cached: ProductListCache) =>
            removeProductFromCache(cached, productId),
        );
    });
}

function buildProductListTargets(siteId: string, page: number, search: string | undefined, limit: number) {
    const targets = [
        { key: queryKeys.siteProductsList(siteId, page, search, limit), allowInsert: !search },
        { key: queryKeys.siteProductsList(siteId, 1, undefined, limit), allowInsert: true },
    ];
    return targets;
}

function upsertProductInCache(
    cache: ProductListCache,
    product: ProductDto,
    options: { allowInsert: boolean; isNew: boolean },
): ProductListCache {
    if (!cache) {
        return cache;
    }
    const index = cache.data.findIndex((item) => item.id === product.id);
    if (index >= 0) {
        const nextData = cache.data.slice();
        nextData[index] = product;
        return { ...cache, data: nextData };
    }
    if (!options.isNew || !options.allowInsert || cache.meta.page !== 1) {
        return cache;
    }
    let nextData = [product, ...cache.data];
    if (nextData.length > cache.meta.limit) {
        nextData = nextData.slice(0, cache.meta.limit);
    }
    const total = typeof cache.meta.total === "number" ? cache.meta.total : cache.data.length;
    return {
        ...cache,
        data: nextData,
        meta: { ...cache.meta, total: total + 1 },
    };
}

function removeProductFromCache(cache: ProductListCache, productId: string): ProductListCache {
    if (!cache) {
        return cache;
    }
    const index = cache.data.findIndex((item) => item.id === productId);
    if (index === -1) {
        return cache;
    }
    const nextData = cache.data.filter((item) => item.id !== productId);
    const total = typeof cache.meta.total === "number" ? cache.meta.total : cache.data.length;
    return {
        ...cache,
        data: nextData,
        meta: { ...cache.meta, total: Math.max(0, total - 1) },
    };
}

function buildCategoryOptions(categories: ProductCategoryDto[]) {
    if (!categories || categories.length === 0) {
        return [] as Array<{ id: string; label: string }>;
    }
    const map = new Map<string, ProductCategoryDto>();
    categories.forEach((category) => {
        map.set(category.id, category);
    });
    return categories.map((category) => ({
        id: category.id,
        label: buildCategoryLabel(category, map),
    }));
}

function buildCategoryLabel(category: ProductCategoryDto, map: Map<string, ProductCategoryDto>) {
    const chain: string[] = [category.name];
    let current = category;
    while (current.parentId) {
        const parent = map.get(current.parentId);
        if (!parent) {
            break;
        }
        chain.push(parent.name);
        current = parent;
    }
    return chain.reverse().join(" / ");
}

function productsPageCount(loading: boolean, meta?: { total: number; limit: number }) {
    if (loading) {
        return "Загрузка товаров";
    }
    if (!meta) {
        return "0 товаров";
    }
    return `${meta.total} товаров`;
}
