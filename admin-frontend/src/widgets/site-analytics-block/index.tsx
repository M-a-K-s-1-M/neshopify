import dashboardCards from "@/shared/mocks/dashboardCards";
import { Group } from "@mantine/core";
import { AnalyticsCard } from "./ui";


export default function SiteAnalyticsBlock() {
    return (
        <Group w={'wrap'} justify="space-between" gap={'xs'}>
            {dashboardCards?.map(card => <AnalyticsCard key={card.id} card={card} />)}
        </Group>
    )
}
