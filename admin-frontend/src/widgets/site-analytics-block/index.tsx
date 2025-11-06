import dashboardCards from "@/shared/mocks/dashboardCards";
import { Grid } from "@mantine/core";
import { AnalyticsCard } from "./ui";


export function SiteAnalyticsBlock() {
    return (
        <Grid grow>
            {dashboardCards?.map(card =>
                <Grid.Col key={card.id} span={3}>
                    <AnalyticsCard card={card} />
                </Grid.Col>
            )}
        </Grid>
    )
}
