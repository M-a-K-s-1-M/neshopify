import { ActionIcon, Box, Flex, Group, Loader, MultiSelect, TextInput } from "@mantine/core";
import { IconDownload, IconFilter } from "@tabler/icons-react";
import './styles.scss';
import { IconSearch } from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useDebouncedCallback } from "@mantine/hooks";

export function SearchUsersWithFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search: string = searchParams.get('_search') ?? '';
    const [searchInput, setSearchInput] = useState<string>(search);

    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = useDebouncedCallback(async (query) => {
        setLoading(true);

        if (query !== '') {
            setSearchParams({ "_users-search": query })
        } else {
            searchParams.delete('_users-search');
            setSearchParams(searchParams);
        }

        setLoading(false);
    }, 500);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
        handleSearch(event.target.value);
    }

    return (
        <Box component="div" p={'lg'} className="search-users-with-filters" bdrs={'md'}>
            <Flex justify={'space-between'} gap={'xs'}>
                <Group>
                    <TextInput
                        type="search"
                        placeholder="Поиск пользователей..."
                        leftSection={loading ? <Loader size={20} /> : <IconSearch size={16} />}
                        w={{ base: 'full', sm: 250 }}
                        value={searchInput}
                        onChange={handleChange}

                    />
                    <MultiSelect placeholder="Роль" />
                    <MultiSelect placeholder="Статус" />
                </Group>

                <Group>
                    <ActionIcon variant="outline" color={'actionIcon'} >
                        <IconFilter size={20} />
                    </ActionIcon>

                    <ActionIcon variant="outline" color="actionIcon">
                        <IconDownload size={20} />
                    </ActionIcon>
                </Group>
            </Flex>
        </Box>
    )
}
