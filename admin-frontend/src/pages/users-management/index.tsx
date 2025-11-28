import { AddUser } from "@/features";
import { UsersAnalytics } from "@/widgets";
import { UsersTableWithSearchAndEdit } from "@/widgets";
import { Box, Flex, Text } from "@mantine/core";

export function UsersManagement() {
    return (
        <Box component="div" p={'xl'}>
            <Flex justify={'space-between'} gap={'xs'} mb={'md'}>
                <Text fz={'2xl'} fw={700}>Управление пользователями</Text>

                <AddUser />
            </Flex>

            <Box component="div" mb={'xl'}>
                <UsersAnalytics />
            </Box>

            <Box component="div">
                <UsersTableWithSearchAndEdit />
            </Box>
        </Box>
    )
}
