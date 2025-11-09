import { UsersTable } from '@/features/user'
import { SearchUsersWithFilters } from '@/features/user'
import { Box } from '@mantine/core'

export function UsersTableWithSearchAndEdit() {
    return (
        <Box component='div'>
            <Box component='div' mb={'md'}>
                <SearchUsersWithFilters />
            </Box>

            <UsersTable />
        </Box>
    )
}
