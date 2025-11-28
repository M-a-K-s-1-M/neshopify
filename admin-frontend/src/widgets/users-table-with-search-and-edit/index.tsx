import { UsersTable } from '@/entities'
import { SearchUsersWithFilters } from '@/features'
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
