import { UsersTable } from '@/features/user'
import { SearchUsersWithFilters } from '@/features/user'
import { Box } from '@mantine/core'

export function UsersTableWithSearchAndEdit() {
    return (
        <Box component='div'>
            <SearchUsersWithFilters />

            <UsersTable />
        </Box>
    )
}
