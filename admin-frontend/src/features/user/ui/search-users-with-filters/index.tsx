import { ActionIcon, Box, Button, Flex, Group, Loader, MultiSelect, Select, TextInput } from "@mantine/core";
import { IconDownload, IconFilter, IconFilterOff, IconTrashX } from "@tabler/icons-react";
import './styles.scss';
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { RolesService } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useUsersFilters } from "@/entities";

export function SearchUsersWithFilters() {
    const { search, roles, banned, update, reset } = useUsersFilters();

    const [inputValue, setInputValue] = useState(search);

    const [loading, setLoading] = useState<boolean>(false);

    const debouncedSearch = useDebouncedCallback(async (query) => {
        setLoading(true);

        update('search', query);

        setLoading(false);
    }, 500);

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {

        setInputValue(event.target.value);
        debouncedSearch(event.target.value);
    }

    const { data: allRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => await RolesService.getAll(),
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchOnReconnect: true,
    })



    return (
        <Box component="div" p={'lg'} className="search-users-with-filters" bdrs={'md'}>
            <Flex justify={'space-between'} gap={'xs'}>
                <Group>
                    <TextInput
                        type="search"
                        placeholder="Поиск пользователей..."
                        leftSection={loading ? <Loader size={20} /> : <IconSearch size={16} />}
                        w={{ base: 'full', sm: 250 }}
                        value={inputValue}
                        onChange={e => handleChangeInput(e)}

                    />

                    <MultiSelect
                        placeholder="Роль"
                        data={allRoles ? allRoles.map(role => role.value) : []}
                        value={roles}
                        onChange={e => update('roles', e)}
                    />

                    <Select
                        placeholder="Статус"
                        data={[
                            { value: "", label: "Все" },
                            { value: 'false', label: 'Активный' },
                            { value: 'true', label: 'Заблокирован' }
                        ]}
                        value={banned}
                        onChange={e => update('banned', e || '')}
                    />

                </Group>

                <Group>
                    <ActionIcon variant="outline" color={'actionIcon'} onClick={() => { reset(); setInputValue('') }}>
                        <IconFilterOff size={20} />
                    </ActionIcon>
                </Group>
            </Flex>
        </Box>
    )
}
