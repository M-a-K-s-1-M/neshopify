import { $api } from '@/lib/config/httpConfig';
import { getOrCreateCartSessionId } from '@/lib/utils/cart-session';

export interface AddCartItemPayload {
    productId: string;
    quantity: number;
    sessionId?: string;
}

export class CartApi {
    static async addItem(siteId: string, payload: AddCartItemPayload): Promise<unknown> {
        const sessionId = payload.sessionId ?? getOrCreateCartSessionId();
        if (!sessionId) {
            throw new Error('Cart sessionId is missing');
        }

        const res = await $api.post(`/sites/${siteId}/cart/items`, {
            productId: payload.productId,
            quantity: payload.quantity,
            sessionId,
        });

        return res.data;
    }
}
