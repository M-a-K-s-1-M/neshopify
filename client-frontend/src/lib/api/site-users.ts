import { $api } from '@/lib/config/httpConfig';
import type { PaginatedResponse, SiteUserDto } from '@/lib/types';

export type SiteUsersListParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'suspended';
    lastActiveFrom?: string;
    lastActiveTo?: string;
};

export class SiteUsersApi {
    static async list(siteId: string, params?: SiteUsersListParams): Promise<PaginatedResponse<SiteUserDto>> {
        const res = await $api.get<PaginatedResponse<SiteUserDto>>(`/sites/${siteId}/users`, {
            params,
        });
        return res.data;
    }
}
