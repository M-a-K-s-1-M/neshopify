import { domainsAnalyticsMock } from "@/shared";
import { Grid } from "@mantine/core";
import { toAnalyticsVM, AnalyticsCard } from "../analytics-card";

export function DomainsAnalytics() {
    return (
        <Grid grow>
            {domainsAnalyticsMock?.map(domainAnalytics =>
                <Grid.Col key={domainAnalytics.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromDomainsAnalytics(domainAnalytics)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
