import usersAnalyticsMock from "@/shared/mocks/usersAnalytics";
import { Grid, Skeleton } from "@mantine/core";
import { AnalyticsCard, toAnalyticsVM } from "../index";
import { useQuery } from "@tanstack/react-query";

export function UsersAnalytics() {
    const { data, isPending, isError } = useQuery({
        queryKey: ['usersAnalytics'],
        queryFn: async () => {
            return usersAnalyticsMock;
        }
    })

    if (isError) return <div>Ошибка загрузки данных</div>;
    if (isPending) return <Skeleton h={{ base: 400, xs: 200, sm: 110 }} w={'100%'} radius={'md'} />;

    return (
        <Grid grow>
            {data?.map(userAnalytics =>
                <Grid.Col key={userAnalytics.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromUsersAnalytics(userAnalytics)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
