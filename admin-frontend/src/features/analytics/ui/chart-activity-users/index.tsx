import { userActivityData } from "@/shared";
import { BarChart } from "@mantine/charts";
import { Box, Skeleton, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

export function ChartActivityUsers() {

    const { data, isPending, isError } = useQuery({
        queryKey: ['userActivityChart'],
        queryFn: async () => {
            return userActivityData;
        }
    })

    if (isError) return <div>Ошибка загрузки данных</div>;

    return (
        <Box component="div" p={'md'}>
            <Text fw={500} size="lg" mb={'xs'}>Активность пользователей</Text>

            {isPending ?
                <Skeleton height={300} w={{ base: 300, sm: '100%' }} />
                :
                <BarChart
                    p={'md'}
                    h={300}
                    w={{ base: 300, sm: '100%' }}
                    data={data}
                    dataKey="month"
                    type="stacked"
                    tickLine="y"
                    series={[
                        { name: 'ActiveUsers', color: 'teal', label: 'Активные пользователи' },
                        { name: 'NewRegistrations', color: 'violet', label: 'Новые регистрации' },
                        { name: 'Sessions', color: 'cyan', label: 'Сессии' },
                    ]}
                />
            }
        </Box>
    )
}
