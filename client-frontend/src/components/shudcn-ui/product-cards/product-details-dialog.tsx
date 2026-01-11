"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart } from "lucide-react";

import type { ProductDto } from "@/lib/types";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/utils/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { getProductPriceLabel } from "./types";

function getMaxQty(product: ProductDto): number {
    if (product.stockStatus === "OUT_OF_STOCK") return 0;
    if (product.stockStatus === "PREORDER") return 99;
    return Math.max(0, Number(product.stock) || 0);
}

export function ProductDetailsDialog({
    product,
    inCart,
    cartQuantity,
    cartBusy,
    onAddToCart,
    onRemoveFromCart,
    onUpdateCartQuantity,
    className,
}: {
    product: ProductDto;
    inCart: boolean;
    cartQuantity?: number;
    cartBusy: boolean;
    onAddToCart?: (quantity: number) => void;
    onRemoveFromCart?: () => void;
    onUpdateCartQuantity?: (quantity: number) => void;
    className?: string;
}) {
    const title = product.title ?? "Товар";
    const description = product.description?.trim() ? product.description : null;
    const priceLabel = getProductPriceLabel(product);

    const media = useMemo(
        () => product.media?.slice().sort((a, b) => a.order - b.order) ?? [],
        [product.media],
    );
    const [selectedIndex, setSelectedIndex] = useState(0);

    const maxQty = getMaxQty(product);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!inCart) return;
        const next = Number(cartQuantity);
        if (!Number.isFinite(next) || next <= 0) {
            setQuantity(1);
            return;
        }
        setQuantity(next);
    }, [cartQuantity, inCart]);

    const selected = media[selectedIndex] ?? media[0] ?? null;
    const effectiveMax = maxQty > 0 ? maxQty : quantity;
    const canDecrement = quantity > 1 && !cartBusy;
    const canIncrement = quantity < Math.max(1, effectiveMax) && !cartBusy;

    const canAdd = Boolean(onAddToCart) && !cartBusy && !inCart && maxQty > 0;
    const canRemove = Boolean(onRemoveFromCart) && !cartBusy && inCart;
    const canUpdateQty = Boolean(onUpdateCartQuantity) && !cartBusy && inCart;

    const handleQtyChange = (next: number) => {
        const clamped = Math.max(1, Math.min(Math.max(1, effectiveMax), next));
        setQuantity(clamped);
        if (inCart) {
            onUpdateCartQuantity?.(clamped);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={className}>Подробнее</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl p-0">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="grid gap-8 p-8 md:grid-cols-[96px_1fr_420px]">
                    {/* Thumbnails */}
                    <div className="hidden md:flex flex-col gap-3">
                        {media.slice(0, 6).map((item, index) => {
                            const isActive = index === selectedIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        "relative h-20 w-20 overflow-hidden rounded-xl border bg-muted",
                                        isActive ? "border-foreground" : "border-border",
                                    )}
                                    aria-label={`Фото ${index + 1}`}
                                >
                                    <Image
                                        src={resolveMediaUrl(item.url)}
                                        alt={item.alt ?? title}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Main image */}
                    <div className="relative overflow-hidden rounded-2xl bg-muted min-h-[360px]">
                        {selected ? (
                            <Image
                                src={resolveMediaUrl(selected.url)}
                                alt={selected.alt ?? title}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : null}
                    </div>

                    {/* Info */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Товар</p>
                            <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
                            {description ? (
                                <p className="text-muted-foreground">{description}</p>
                            ) : null}
                        </div>

                        <p className="text-3xl font-semibold">{priceLabel}</p>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-xl border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-11 w-11 rounded-none"
                                    disabled={!canDecrement || (inCart && !canUpdateQty)}
                                    onClick={() => handleQtyChange(quantity - 1)}
                                >
                                    –
                                </Button>
                                <span className="w-10 text-center text-sm">{quantity}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-11 w-11 rounded-none"
                                    disabled={!canIncrement || (inCart && !canUpdateQty)}
                                    onClick={() => handleQtyChange(quantity + 1)}
                                >
                                    +
                                </Button>
                            </div>

                            {inCart ? (
                                <Button
                                    type="button"
                                    onClick={onRemoveFromCart}
                                    disabled={!canRemove}
                                    className="h-11"
                                >
                                    {cartBusy ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Удаляем
                                        </span>
                                    ) : (
                                        "Убрать из корзины"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => onAddToCart?.(quantity)}
                                    disabled={!canAdd}
                                    className="h-11"
                                >
                                    {cartBusy ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Добавляем
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" /> В корзину
                                        </span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
