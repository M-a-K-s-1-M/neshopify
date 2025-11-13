import { revenueData } from "@/shared";
import { Box, Text } from "@mantine/core";
import { BarChart } from "@mantine/charts";

export function ChartRevenue() {
    return (
        <Box component="div" p={'md'} >
            <Text fw={500} size="lg" mb={'xs'}>График доходов</Text>

            <BarChart
                p={'md'}
                h={300}
                w={{ base: 300, sm: '100%' }}
                data={revenueData}
                dataKey={'month'}
                type="stacked"
                tickLine="y"
                series={[
                    { name: 'Ads', color: 'blue', label: 'Реклама' },
                    { name: 'Sales', color: 'green', label: 'Продажи' },
                    { name: 'Subscriptions', color: 'orange', label: 'Подписки' },
                ]}
            />
        </Box>
    )
}
