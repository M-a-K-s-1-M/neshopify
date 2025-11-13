import { BlockChartsRevenueAndActivityUsers, ReviewAnalytics } from "@/widgets";
import { Box, Text } from "@mantine/core";

export function Analytics() {
    return (
        <Box component="div" p={'xl'}>
            <Text fz={'2xl'} fw={700} mb={'md'}>Аналитика</Text>

            <Box component="div" mb={'xl'}>
                <ReviewAnalytics />
            </Box>

            <Box component='div'>
                <BlockChartsRevenueAndActivityUsers />
            </Box>
        </Box>
    )
}
