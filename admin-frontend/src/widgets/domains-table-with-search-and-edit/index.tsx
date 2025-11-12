import { DomainsTable, SearchDomainsWithFilters } from "@/features/domain"
import { Box } from "@mantine/core"

export function DomainsTableWithSerachAndEdit() {
    return (
        <Box component='div'>
            <Box component='div' mb={'md'}>
                <SearchDomainsWithFilters />
            </Box>

            <DomainsTable />
        </Box>
    )
}
