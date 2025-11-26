import dashboardCards from "@/shared/mocks/dashboardCards";
import { Grid, Skeleton } from "@mantine/core";
import { AnalyticsCard } from "../index";
import { toAnalyticsVM } from "../index";
import { useQuery } from "@tanstack/react-query";

export function ReviewAnalytics() {
    const { data, isPending, isError } = useQuery({
        queryKey: ['reviewAnalytics'],
        queryFn: async () => {
            return dashboardCards;
        }
    })

    if (isError) return <div>Ошибка загрузки данных</div>;
    if (isPending) return <Skeleton h={{ base: 400, xs: 200, md: 130 }} w={'100%'} radius={'md'} />;

    return (
        <Grid grow>
            {data?.map(card =>
                <Grid.Col key={card.id} span={3}>
                    <AnalyticsCard card={toAnalyticsVM.fromReviewAnalytics(card)} />
                </Grid.Col>
            )}
        </Grid>
    )
}
