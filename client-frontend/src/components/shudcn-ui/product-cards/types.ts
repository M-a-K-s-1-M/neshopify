import type { ProductDto } from "@/lib/types";

export type ProductCardDesignKey = "design-01" | "design-02" | "design-03";

export interface ProductCardProps {
    product: ProductDto;
    isFavorited?: boolean;
    inCart?: boolean;
    cartQuantity?: number;
    cartBusy?: boolean;
    onToggleFavorite?: () => void;
    /** @deprecated Use onAddToCart/onRemoveFromCart for quantity-aware actions */
    onToggleCart?: () => void;
    onAddToCart?: (quantity: number) => void;
    onRemoveFromCart?: () => void;
    onUpdateCartQuantity?: (quantity: number) => void;
    className?: string;
}

export function getProductPriceLabel(product: ProductDto): string {
    const price = Number(product.price);
    if (Number.isFinite(price)) {
        return `${price.toLocaleString("ru-RU")} ${product.currency}`.trim();
    }

    return `${String(product.price)} ${product.currency}`.trim();
}
