import { domainsAnalyticsMock } from "@/shared";
import { Grid, Skeleton } from "@mantine/core";
import { toAnalyticsVM, AnalyticsCard } from "../analytics-card";
import { useQuery } from "@tanstack/react-query";

export function DomainsAnalytics() {
    const { data, isPending, isError } = useQuery({
        queryKey: ['domainsAnalytics'],
        queryFn: async () => {
            return domainsAnalyticsMock;
        }
    })

    if (isError) return <div>Ошибка загрузки данных</div>;

    if (isPending) return <Skeleton h={{ base: 400, xs: 200, md: 120 }} w={'100%'} radius={'md'} />;

    return (
        <Grid grow>
            {data?.map(domainAnalytics =>
                <Grid.Col key={domainAnalytics.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromDomainsAnalytics(domainAnalytics)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
