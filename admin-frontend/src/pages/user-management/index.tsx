import { AddUser } from "@/features/user";
import { UsersAnalytics } from "@/widgets/site-analytics-block";
import { Box, Flex, Text } from "@mantine/core";

export function UserManagement() {
    return (
        <Box component="div" p={'xl'}>
            <Flex justify={'space-between'} gap={'xs'} mb={'md'}>
                <Text fz={'2xl'} fw={700}>Управление пользователями</Text>

                <AddUser />
            </Flex>

            <Box component="div">
                <UsersAnalytics />
            </Box>
        </Box>
    )
}
