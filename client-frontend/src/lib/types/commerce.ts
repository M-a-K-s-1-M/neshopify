import type { ProductDto } from './site';

export type OrderStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
export type PaymentStatus = "NOT_PAID" | "PENDING" | "PAID" | "REFUNDED";

export interface OrderItemDto {
    id: string;
    orderId: string;
    productId: string;
    title: string;
    price: string | number;
    quantity: number;
    createdAt: string;
}

export interface OrderDto {
    id: string;
    siteId: string;
    userId?: string | null;
    total: string | number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    items: OrderItemDto[];
}

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
