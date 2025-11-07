import dashboardCards from "@/shared/mocks/dashboardCards";
import { Grid } from "@mantine/core";
import { AnalyticsCard } from "../index";
import { toAnalyticsVM } from "../index";

export function ReviewAnalytics() {
    return (
        <Grid grow>
            {dashboardCards?.map(card =>
                <Grid.Col key={card.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromReviewAnalytics(card)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
