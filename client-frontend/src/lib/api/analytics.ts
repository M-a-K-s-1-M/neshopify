import { $api } from '@/lib/config/httpConfig';
import type { SiteAnalyticsSummaryDto } from '@/lib/types';

export class SiteAnalyticsApi {
    static async summary(siteId: string): Promise<SiteAnalyticsSummaryDto> {
        const res = await $api.get<SiteAnalyticsSummaryDto>(`/sites/${siteId}/analytics/summary`);
        return res.data;
    }
}
