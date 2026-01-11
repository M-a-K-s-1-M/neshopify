import { $api } from '@/lib/config/httpConfig';
import type { CartDto } from '@/lib/types';

export interface AddCartItemPayload {
    productId: string;
    quantity: number;
    sessionId?: string;
}

export interface UpdateCartItemPayload {
    quantity: number;
    sessionId?: string;
}

export interface StripeCheckoutPayload {
    customerEmail: string;
    customerPhone?: string;
    shippingAddress?: string;
    notes?: string;
    sessionId?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface StripeCheckoutResponse {
    checkoutUrl: string;
}

export class CartApi {
    static async getCart(siteId: string, sessionId?: string): Promise<CartDto> {
        const res = await $api.get<CartDto>(`/sites/${siteId}/cart`, {
            params: sessionId ? { sessionId } : undefined,
        });

        return res.data;
    }

    static async addItem(siteId: string, payload: AddCartItemPayload): Promise<CartDto> {
        const res = await $api.post<CartDto>(`/sites/${siteId}/cart/items`, {
            productId: payload.productId,
            quantity: payload.quantity,
            ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
        });

        return res.data;
    }

    static async updateItem(siteId: string, itemId: string, payload: UpdateCartItemPayload): Promise<CartDto> {
        const res = await $api.patch<CartDto>(`/sites/${siteId}/cart/items/${itemId}`, {
            quantity: payload.quantity,
            ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
        });

        return res.data;
    }

    static async removeItem(siteId: string, itemId: string, sessionId?: string): Promise<CartDto> {
        const res = await $api.delete<CartDto>(`/sites/${siteId}/cart/items/${itemId}`, {
            params: sessionId ? { sessionId } : undefined,
        });

        return res.data;
    }

    static async clear(siteId: string, sessionId?: string): Promise<CartDto> {
        const res = await $api.delete<CartDto>(`/sites/${siteId}/cart`, {
            params: sessionId ? { sessionId } : undefined,
        });

        return res.data;
    }

    static async checkoutStripe(siteId: string, payload: StripeCheckoutPayload): Promise<StripeCheckoutResponse> {
        const res = await $api.post<StripeCheckoutResponse>(`/sites/${siteId}/cart/checkout/stripe`, {
            customerEmail: payload.customerEmail,
            ...(payload.customerPhone ? { customerPhone: payload.customerPhone } : {}),
            ...(payload.shippingAddress ? { shippingAddress: payload.shippingAddress } : {}),
            ...(payload.notes ? { notes: payload.notes } : {}),
            ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
            successUrl: payload.successUrl,
            cancelUrl: payload.cancelUrl,
        });

        return res.data;
    }
}
