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

export type OrderStatusDto = "DRAFT" | "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
export type PaymentStatusDto = "NOT_PAID" | "PENDING" | "PAID" | "REFUNDED";

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
    cartId?: string | null;

    total: string | number;
    status: OrderStatusDto;
    paymentStatus: PaymentStatusDto;
    paymentProvider?: string | null;
    paymentIntentId?: string | null;
    paymentSessionId?: string | null;

    customerEmail: string;
    customerPhone?: string | null;

    items?: OrderItemDto[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderListResponseDto {
    data: OrderDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
