import { Box, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
    const isMobile = useMediaQuery('(max-width: 778px)');

    return (
        <Paper p={'xl'} radius={isMobile ? '' : 'md'} shadow="xl" popover="auto" withBorder w={{ base: '100%', sm: 400 }} h={{ base: '100%', sm: 420 }}>
            <Box pt={30}>
                <Text ta={'center'} fw={700} fz={'h2'}>Cosmiq Admin</Text>
                <Text ta={'center'} fz={'sm'} c="dimmed" mb={'lg'}>Панель администратора</Text>
            </Box>

            <Outlet />
        </Paper>
    )
}
