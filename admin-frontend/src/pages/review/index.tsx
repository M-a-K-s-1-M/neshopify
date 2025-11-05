import SiteAnalyticsBlock from "@/widgets/site-analytics-block";
import { Box, Text } from "@mantine/core";

export function Review() {
    return (
        <Box component="div" p={'xl'}>
            <Text fz={24} fw={700} mb={'md'}>Обзор</Text>
            <SiteAnalyticsBlock />
        </Box>
    )
}
