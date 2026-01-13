'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { Button, Input, Label } from '@/components';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import { CategoriesApi } from '@/lib/api/categories';
import { ProductMediaApi } from '@/lib/api/product-media';
import { ProductsApi } from '@/lib/api/products';
import type { PaginatedResponse, ProductCategoryDto, ProductDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getRequestErrorMessage } from '@/lib/utils/error';
import { resolveMediaUrl } from '@/lib/utils/media';

const PAGE_SIZE = 12;

const DEFAULT_FORM = {
    title: '',
    description: '',
    price: '',
    stock: '0',
    categoryId: '',
};

type ProductEditFormState = typeof DEFAULT_FORM;

export function ProductsCatalogEditor({ siteId }: { siteId: string }) {
    const [page, setPage] = useState(1);

    const [productsPage, setProductsPage] = useState<PaginatedResponse<ProductDto> | null>(null);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);

    const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
    const [selectedLoading, setSelectedLoading] = useState(false);

    const [formState, setFormState] = useState<ProductEditFormState>({ ...DEFAULT_FORM });
    const [formError, setFormError] = useState<string | null>(null);

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const mediaInputRef = useRef<HTMLInputElement | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

    const products = productsPage?.data ?? [];
    const meta = productsPage?.meta;

    const maxPage = useMemo(() => {
        if (!meta) return 1;
        return Math.max(1, Math.ceil((meta.total ?? 0) / meta.limit));
    }, [meta]);

    const categoryOptions = useMemo(() => buildCategoryOptions(categories), [categories]);
    const categorySelectValue = formState.categoryId ? formState.categoryId : '__none__';

    const canEditMedia = Boolean(selectedProductId) && !isSaving && !isDeletingProduct;

    async function loadProducts(nextPage = page) {
        setProductsLoading(true);
        setProductsError(null);
        try {
            const res = await ProductsApi.list(siteId, { page: nextPage, limit: PAGE_SIZE });
            setProductsPage(res);
        } catch (e) {
            setProductsError(getRequestErrorMessage(e, 'Не удалось загрузить товары'));
        } finally {
            setProductsLoading(false);
        }
    }

    async function loadCategories() {
        setCategoriesLoading(true);
        try {
            const res = await CategoriesApi.list(siteId);
            setCategories(res);
        } catch {
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    }

    async function loadSelectedProduct(productId: string) {
        setSelectedLoading(true);
        try {
            const res = await ProductsApi.get(siteId, productId);
            setSelectedProduct(res);
            setFormState({
                title: res.title ?? '',
                description: res.description ?? '',
                price: String(res.price ?? ''),
                stock: String(res.stock ?? 0),
                categoryId: res.categoryId ?? '',
            });
            setFormError(null);
            setPendingFiles([]);
            if (mediaInputRef.current) {
                mediaInputRef.current.value = '';
            }
        } catch (e) {
            setSelectedProduct(null);
            setFormError(getRequestErrorMessage(e, 'Не удалось загрузить товар'));
        } finally {
            setSelectedLoading(false);
        }
    }

    useEffect(() => {
        void loadProducts(1);
        void loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    useEffect(() => {
        void loadProducts(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        if (!dialogOpen || !selectedProductId) {
            return;
        }
        void loadSelectedProduct(selectedProductId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogOpen, selectedProductId]);

    const handleCardClick = (product: ProductDto) => {
        setSelectedProductId(product.id);
        setDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedProductId(null);
            setSelectedProduct(null);
            setFormState({ ...DEFAULT_FORM });
            setFormError(null);
            setPendingFiles([]);
            if (mediaInputRef.current) {
                mediaInputRef.current.value = '';
            }
        }
    };

    const handleChange = (key: keyof ProductEditFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!selectedProductId) return;

        const title = formState.title.trim();
        const priceNumber = Number(formState.price);
        const stockNumber = Number.isFinite(Number(formState.stock)) ? Math.max(0, parseInt(formState.stock || '0', 10)) : 0;

        if (!title) {
            setFormError('Название обязательно');
            return;
        }

        if (!Number.isFinite(priceNumber) || priceNumber < 0) {
            setFormError('Введите корректную цену');
            return;
        }

        setIsSaving(true);
        setFormError(null);

        try {
            await ProductsApi.update(siteId, selectedProductId, {
                title,
                description: formState.description?.trim() || undefined,
                price: priceNumber,
                stock: stockNumber,
                categoryId: formState.categoryId || undefined,
            });

            await loadSelectedProduct(selectedProductId);
            await loadProducts(page);
        } catch (e) {
            setFormError(getRequestErrorMessage(e, 'Не удалось сохранить товар'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProductId) return;
        if (!window.confirm('Удалить товар?')) return;

        setIsDeletingProduct(true);
        try {
            await ProductsApi.remove(siteId, selectedProductId);
            setDialogOpen(false);
            await loadProducts(page);
        } catch (e) {
            setFormError(getRequestErrorMessage(e, 'Не удалось удалить товар'));
        } finally {
            setIsDeletingProduct(false);
        }
    };

    const handleUploadMedia = async () => {
        if (!selectedProductId) return;
        if (pendingFiles.length === 0) return;

        setIsUploadingMedia(true);
        try {
            await ProductMediaApi.upload(siteId, selectedProductId, pendingFiles);
            setPendingFiles([]);
            if (mediaInputRef.current) {
                mediaInputRef.current.value = '';
            }
            await loadSelectedProduct(selectedProductId);
            await loadProducts(page);
        } catch (e) {
            setFormError(getRequestErrorMessage(e, 'Не удалось загрузить фотографии'));
        } finally {
            setIsUploadingMedia(false);
        }
    };

    const handleDeleteMedia = async (mediaId: string) => {
        if (!selectedProductId) return;
        if (!window.confirm('Удалить эту фотографию?')) return;

        setDeletingMediaId(mediaId);
        try {
            await ProductMediaApi.remove(siteId, selectedProductId, mediaId);
            await loadSelectedProduct(selectedProductId);
            await loadProducts(page);
        } catch (e) {
            setFormError(getRequestErrorMessage(e, 'Не удалось удалить фотографию'));
        } finally {
            setDeletingMediaId(null);
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Товары</h1>
                    <p className="text-sm text-muted-foreground">Нажмите на карточку, чтобы отредактировать товар.</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        Стр. {meta?.page ?? 1} из {maxPage}
                    </span>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={productsLoading || (meta?.page ?? 1) <= 1}
                    >
                        Назад
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                        disabled={productsLoading || (meta?.page ?? 1) >= maxPage}
                    >
                        Далее
                    </Button>
                </div>
            </div>

            {productsError ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-destructive">{productsError}</div>
            ) : null}

            {productsLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <Card key={idx} className="py-0 overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <CardContent className="pt-4">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="mt-2 h-3 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                    Товаров пока нет.
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => handleCardClick(product)}
                            className="text-left"
                        >
                            <Card className="py-0 overflow-hidden transition-colors hover:bg-accent/20">
                                <div className="relative h-40 w-full overflow-hidden border-b border-border bg-background">
                                    <ProductCardImage product={product} />
                                </div>
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                                        <p className="shrink-0 text-sm font-semibold">
                                            {Number(product.price).toLocaleString('ru-RU')} {product.currency}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">Остаток: {product.stock}</p>
                                </CardContent>
                            </Card>
                        </button>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-[720px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedProduct?.title ?? 'Редактирование товара'}</DialogTitle>
                        <DialogDescription>Изменения сохраняются в каталог сайта.</DialogDescription>
                    </DialogHeader>

                    {selectedLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-title">Название*</Label>
                                <Input
                                    id="product-title"
                                    placeholder="Например, Космическая худи"
                                    value={formState.title}
                                    onChange={(event) => handleChange('title', event.target.value)}
                                    disabled={isSaving || isDeletingProduct}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-description">Описание</Label>
                                <textarea
                                    id="product-description"
                                    className={cn(
                                        'min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                                        (isSaving || isDeletingProduct) && 'opacity-70'
                                    )}
                                    placeholder="Расскажите, почему этот товар особенный"
                                    value={formState.description}
                                    onChange={(event) => handleChange('description', event.target.value)}
                                    disabled={isSaving || isDeletingProduct}
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
                                        onChange={(event) => handleChange('price', event.target.value)}
                                        disabled={isSaving || isDeletingProduct}
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
                                        onChange={(event) => handleChange('stock', event.target.value)}
                                        disabled={isSaving || isDeletingProduct}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product-category">Категория</Label>
                                <Select
                                    value={categorySelectValue}
                                    onValueChange={(value) => handleChange('categoryId', value === '__none__' ? '' : value)}
                                    disabled={categoriesLoading || isSaving || isDeletingProduct}
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

                                {selectedProduct?.media?.length ? (
                                    <div className="space-y-2">
                                        {selectedProduct.media
                                            .slice()
                                            .sort((a, b) => a.order - b.order)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-2"
                                                >
                                                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                                                        <Image
                                                            src={resolveMediaUrl(item.url)}
                                                            alt={item.alt ?? selectedProduct.title}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium line-clamp-1">{item.alt ?? 'Фото'}</p>
                                                        <p className="text-xs text-muted-foreground">Порядок: {item.order}</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={!canEditMedia || deletingMediaId === item.id}
                                                        onClick={() => void handleDeleteMedia(item.id)}
                                                    >
                                                        Удалить
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
                                    disabled={!canEditMedia}
                                    onClick={(event) => {
                                        (event.currentTarget as HTMLInputElement).value = '';
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
                                    disabled={!canEditMedia || pendingFiles.length === 0 || isUploadingMedia}
                                    onClick={() => void handleUploadMedia()}
                                >
                                    {isUploadingMedia ? 'Загружаем…' : `Загрузить (${pendingFiles.length || 0})`}
                                </Button>
                            </div>

                            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    onClick={() => void handleSave()}
                                    disabled={!selectedProductId || isSaving || isDeletingProduct}
                                >
                                    {isSaving ? 'Сохраняем…' : 'Сохранить изменения'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => void handleDeleteProduct()}
                                    disabled={!selectedProductId || isSaving || isDeletingProduct}
                                >
                                    {isDeletingProduct ? 'Удаляем…' : 'Удалить товар'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

function ProductCardImage({ product }: { product: ProductDto }) {
    const media = product.media?.slice().sort((a, b) => a.order - b.order)[0];
    if (!media?.url) {
        return (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Нет фото
            </div>
        );
    }

    return (
        <Image
            src={resolveMediaUrl(media.url)}
            alt={media.alt ?? product.title}
            fill
            unoptimized
            className="object-cover"
        />
    );
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
    return chain.reverse().join(' / ');
}
