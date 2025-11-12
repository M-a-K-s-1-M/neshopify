import type { IDashboardCard } from "@/shared/mocks/dashboardCards";
import type { IAnalyticsCardVM } from "./index";
import type { IUsersMetric } from "@/shared/mocks/usersAnalytics";
import type { IDomainsMetric } from "@/shared";

export const toAnalyticsVM = {
    fromReviewAnalytics: (card: IDashboardCard): IAnalyticsCardVM => ({
        id: card.id,
        title: card.title,
        value: card.value,
        changeLabel: card.changeLabel,
    }),

    fromUsersAnalytics: (card: IUsersMetric): IAnalyticsCardVM => ({
        id: card.id,
        title: card.title,
        value: card.valueFormatted,
    }),

    fromDomainsAnalytics: (card: IDomainsMetric): IAnalyticsCardVM => ({
        id: card.id,
        title: card.title,
        value: card.valueFormatted,
        changeLabel: card.changeLabel,
    }),
};