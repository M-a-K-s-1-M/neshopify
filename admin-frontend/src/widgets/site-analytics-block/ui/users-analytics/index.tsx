import usersAnalyticsMock from "@/shared/mocks/usersAnalytics";
import { Grid } from "@mantine/core";
import { AnalyticsCard, toAnalyticsVM } from "../index";

export function UsersAnalytics() {
    return (
        <Grid grow>
            {usersAnalyticsMock?.map(userAnalytics =>
                <Grid.Col key={userAnalytics.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromUsersAnalytics(userAnalytics)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
