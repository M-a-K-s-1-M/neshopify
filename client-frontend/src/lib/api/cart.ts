import { $api } from '@/lib/config/httpConfig';
import { getOrCreateCartSessionId } from '@/lib/utils/cart-session';
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

export class CartApi {
    static async getCart(siteId: string, sessionId?: string): Promise<CartDto> {
        const resolvedSessionId = sessionId ?? getOrCreateCartSessionId();
        if (!resolvedSessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.get<CartDto>(`/sites/${siteId}/cart`, {
            params: { sessionId: resolvedSessionId },
        });

        return res.data;
    }

    static async addItem(siteId: string, payload: AddCartItemPayload): Promise<CartDto> {
        const sessionId = payload.sessionId ?? getOrCreateCartSessionId();
        if (!sessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.post<CartDto>(`/sites/${siteId}/cart/items`, {
            productId: payload.productId,
            quantity: payload.quantity,
            sessionId,
        });

        return res.data;
    }

    static async updateItem(siteId: string, itemId: string, payload: UpdateCartItemPayload): Promise<CartDto> {
        const sessionId = payload.sessionId ?? getOrCreateCartSessionId();
        if (!sessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.patch<CartDto>(`/sites/${siteId}/cart/items/${itemId}`, {
            quantity: payload.quantity,
            sessionId,
        });

        return res.data;
    }

    static async removeItem(siteId: string, itemId: string, sessionId?: string): Promise<CartDto> {
        const resolvedSessionId = sessionId ?? getOrCreateCartSessionId();
        if (!resolvedSessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.delete<CartDto>(`/sites/${siteId}/cart/items/${itemId}`, {
            params: { sessionId: resolvedSessionId },
        });

        return res.data;
    }

    static async clear(siteId: string, sessionId?: string): Promise<CartDto> {
        const resolvedSessionId = sessionId ?? getOrCreateCartSessionId();
        if (!resolvedSessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.delete<CartDto>(`/sites/${siteId}/cart`, {
            params: { sessionId: resolvedSessionId },
        });

        return res.data;
    }
}
