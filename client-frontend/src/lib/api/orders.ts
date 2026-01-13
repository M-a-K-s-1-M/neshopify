import { $api } from "@/lib/config/httpConfig";
import type { OrderDto } from "@/lib/types";

export class OrdersApi {
    static async listMyPaid(siteId: string): Promise<OrderDto[]> {
        const res = await $api.get<OrderDto[]>(`/storefront/sites/${siteId}/orders/my`);
        return res.data;
    }
}
