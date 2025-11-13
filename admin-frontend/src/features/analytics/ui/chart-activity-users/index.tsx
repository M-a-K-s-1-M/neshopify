import { userActivityData } from "@/shared";
import { BarChart } from "@mantine/charts";
import { Box, Text } from "@mantine/core";

export function ChartActivityUsers() {
    return (
        <Box component="div" p={'md'}>
            <Text fw={500} size="lg" mb={'xs'}>Активность пользователей</Text>

            <BarChart
                p={'md'}
                h={300}
                w={{ base: 300, sm: '100%' }}
                data={userActivityData}
                dataKey="month"
                type="stacked"
                tickLine="y"
                series={[
                    { name: 'ActiveUsers', color: 'teal', label: 'Активные пользователи' },
                    { name: 'NewRegistrations', color: 'violet', label: 'Новые регистрации' },
                    { name: 'Sessions', color: 'cyan', label: 'Сессии' },
                ]}
            />
        </Box>
    )
}
