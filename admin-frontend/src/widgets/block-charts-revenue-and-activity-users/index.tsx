import { ChartActivityUsers, ChartRevenue } from "@/features/index";
import { Grid } from "@mantine/core";

export function BlockChartsRevenueAndActivityUsers() {
    return (
        <Grid grow>
            <Grid.Col span={6}>
                <ChartRevenue />
            </Grid.Col>

            <Grid.Col span={6}>
                <ChartActivityUsers />
            </Grid.Col>
        </Grid>
    )
}
