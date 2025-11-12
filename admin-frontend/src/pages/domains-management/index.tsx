import { AddDomain } from "@/features/domain";
import { DomainsAnalytics } from "@/widgets/site-analytics-block";
import { Box, Flex, Text } from "@mantine/core";

export function DomainsManagement() {
    return (
        <Box component="div" p={'xl'}>
            <Flex justify={'space-between'} gap={'xs'} mb={'md'}>
                <Text fz={'2xl'} fw={700}>Управление доменами</Text>

                <AddDomain />
            </Flex>

            <Box component="div">
                <DomainsAnalytics />
            </Box>
        </Box>
    )
}
