import { AddUser } from "@/features/user";
import { UsersAnalytics } from "@/widgets/site-analytics-block";
import { UsersTableWithSearchAndEdit } from "@/widgets/users-table-with-search-and-edit";
import { Box, Flex, Text } from "@mantine/core";

export function UserManagement() {
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
