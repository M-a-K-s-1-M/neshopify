import { $api } from '@/lib/config/httpConfig';
import type { SiteAnalyticsSummaryDto, SiteRegistrationsDto } from '@/lib/types';

export class SiteAnalyticsApi {
    static async summary(siteId: string): Promise<SiteAnalyticsSummaryDto> {
        const res = await $api.get<SiteAnalyticsSummaryDto>(`/sites/${siteId}/analytics/summary`);
        return res.data;
    }

    static async registrations(siteId: string, months = 12): Promise<SiteRegistrationsDto> {
        const res = await $api.get<SiteRegistrationsDto>(`/sites/${siteId}/analytics/registrations`, {
            params: { months },
        });
        return res.data;
    }
}
