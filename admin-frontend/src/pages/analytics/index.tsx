import { BlockChartsRevenueAndActivityUsers, LastTransactions, ReviewAnalytics, TopStores } from "@/widgets";
import { Box, Grid, Text } from "@mantine/core";

export function Analytics() {
    return (
        <Box component="div" p={'xl'}>
            <Text fz={'2xl'} fw={700} mb={'md'}>Аналитика</Text>

            <Box component="div" mb={'xl'}>
                <ReviewAnalytics />
            </Box>

            <Box component='div' mb={'md'}>
                <BlockChartsRevenueAndActivityUsers />
            </Box>

            <Box component="div">
                <Grid grow>
                    <Grid.Col span={6}>
                        <TopStores />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <LastTransactions />
                    </Grid.Col>
                </Grid>
            </Box>
        </Box>
    )
}
