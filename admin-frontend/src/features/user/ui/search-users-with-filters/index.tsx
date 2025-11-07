import { ActionIcon, Box, Flex, Group, MultiSelect, TextInput } from "@mantine/core";
import { IconDownload, IconFilter } from "@tabler/icons-react";
import './styles.scss';
import { IconSearch } from "@tabler/icons-react";

export function SearchUsersWithFilters() {
    return (
        <Box component="div" p={'lg'} className="search-users-with-filters" bdrs={'md'}>
            <Flex justify={'space-between'} gap={'xs'}>
                <Group>
                    <TextInput placeholder="Поиск пользователей..." leftSection={<IconSearch size={16} />} w={{ base: 200, sm: 250 }} />
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
