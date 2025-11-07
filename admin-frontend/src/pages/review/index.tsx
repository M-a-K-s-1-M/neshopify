import { AddDomain, DomainsTableMini } from "@/features/domain";
import { AddUser, SearchUsers, UsersTableMini } from "@/features/user";
import usersMock from "@/shared/mocks/users";
import domainsMock from "@/shared/mocks/domains";
import { SiteAnalyticsBlock } from "@/widgets/site-analytics-block";
import { Box, Flex, Group, Text } from "@mantine/core";

export function Review() {
    return (
        <Box component="div" p={'xl'}>
            <Text fz={'2xl'} fw={700} mb={'md'}>Обзор</Text>

            <Box component="div" mb={'2xl'}>
                <SiteAnalyticsBlock />
            </Box>

            <Box component="div" mb={'2xl'}>
                <Flex justify={'space-between'} gap={'xs'} wrap={'wrap'} mb={'md'}>
                    <Text size={'lg'} fw={500}>Управление пользователями</Text>

                    <Group>
                        <SearchUsers />
                        <AddUser />
                    </Group>
                </Flex>

                <UsersTableMini data={usersMock} />
            </Box>

            <Box component="div" mb={'md'}>
                <Flex justify={'space-between'} gap={'xs'} wrap={"wrap"} mb={'md'}>
                    <Text size={'lg'} fw={500}>Управление доменами</Text>

                    <AddDomain />
                </Flex>

                <DomainsTableMini data={domainsMock} />
            </Box>
        </Box>
    )
}
