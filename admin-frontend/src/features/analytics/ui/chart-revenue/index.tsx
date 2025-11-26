import { revenueData } from "@/shared";
import { Box, Skeleton, Text } from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { useQuery } from "@tanstack/react-query";

export function ChartRevenue() {


    const { data, isPending, isError } = useQuery({
        queryKey: ['revenueChart'],
        queryFn: async () => {
            return revenueData;
        }
    });

    if (isError) return <div>Ошибка загрузки данных</div>;

    return (
        <Box component="div" p={'md'} >
            <Text fw={500} size="lg" mb={'xs'}>График доходов</Text>

            {isPending ?
                <Skeleton height={300} w={{ base: 300, sm: '100%' }} />
                :
                <BarChart
                    p={'md'}
                    h={300}
                    w={{ base: 300, sm: '100%' }}
                    data={data}
                    dataKey={'month'}
                    type="stacked"
                    tickLine="y"
                    series={[
                        { name: 'Ads', color: 'blue', label: 'Реклама' },
                        { name: 'Sales', color: 'green', label: 'Продажи' },
                        { name: 'Subscriptions', color: 'orange', label: 'Подписки' },
                    ]}
                />

            }

        </Box>
    )
}
