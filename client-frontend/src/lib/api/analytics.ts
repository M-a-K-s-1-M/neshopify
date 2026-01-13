import { $api } from '@/lib/config/httpConfig';
import type { SiteAnalyticsSummaryDto, SiteOrdersSeriesDto, SiteRegistrationsDto } from '@/lib/types';

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

    static async ordersSeries(siteId: string, months = 12): Promise<SiteOrdersSeriesDto> {
        const res = await $api.get<SiteOrdersSeriesDto>(`/sites/${siteId}/analytics/orders`, {
            params: { months },
        });
        return res.data;
    }
}
