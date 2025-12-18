import type { ProductDto } from "@/lib/types";

export type ProductCardDesignKey = "design-01" | "design-02" | "design-03";

export interface ProductCardProps {
    product: ProductDto;
    isFavorited?: boolean;
    inCart?: boolean;
    cartBusy?: boolean;
    onToggleFavorite?: () => void;
    onToggleCart?: () => void;
    className?: string;
}

export function getProductPriceLabel(product: ProductDto): string {
    const price = Number(product.price);
    if (Number.isFinite(price)) {
        return `${price.toLocaleString("ru-RU")} ${product.currency}`.trim();
    }

    return `${String(product.price)} ${product.currency}`.trim();
}
