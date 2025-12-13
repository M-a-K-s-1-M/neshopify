import type { ProductDto } from './site';

export interface CartItemDto {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: string | number;
    product?: ProductDto;
    createdAt: string;
}

export interface CartDto {
    id?: string;
    siteId: string;
    userId?: string | null;
    sessionId?: string | null;
    items: CartItemDto[];
    createdAt?: string;
    updatedAt?: string;
    total?: string | number;
}
