import { AddDomain, DomainsTableMini } from "@/features";
import { AddUser, SearchUsers } from "@/features";
import { Box, Flex, Group, Text } from "@mantine/core";
import { ReviewAnalytics } from "@/widgets";
import { UsersTableMini } from "@/entities";


export function Review() {
    return (
        <Box component="div" p={'xl'} bg={'white'}>
            <Text fz={'2xl'} fw={700} mb={'md'}>Обзор</Text>

            <Box component="div" mb={'2xl'}>
                <ReviewAnalytics />
            </Box>

            <Box component="div" mb={'2xl'}>
                <Flex justify={'space-between'} gap={'xs'} wrap={'wrap'} mb={'md'}>
                    <Text size={'lg'} fw={500}>Управление пользователями</Text>

                    <Group>
                        <SearchUsers />
                        <AddUser />
                    </Group>
                </Flex>

                <UsersTableMini />
            </Box>

            <Box component="div" mb={'md'}>
                <Flex justify={'space-between'} gap={'xs'} wrap={"wrap"} mb={'md'}>
                    <Text size={'lg'} fw={500}>Управление доменами</Text>

                    <AddDomain />
                </Flex>

                <DomainsTableMini />
            </Box>
        </Box>
    )
}
