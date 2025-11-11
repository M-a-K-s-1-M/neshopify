import { useSearchParams } from 'react-router-dom';
import { Table, Checkbox, Pagination, Group, Avatar, Box, Text, Badge, ActionIcon } from '@mantine/core';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import './sytels.scss';
import { useQuery } from '@tanstack/react-query';
import { getUsers, } from '@/shared';

// Заголовки (кроме колонки чекбокса). Используем для вычисления colSpan футера.
const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

export function UsersTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page: number = searchParams.get('_page') ? Number(searchParams.get('_page')) : 1;
    const limit: number = 5;

    const search: string = searchParams.get('_search') ?? '';

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users-table', search],
        queryFn: () => getUsers({ search }),
    });

    if (isPending) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    const rows = users.slice((page - 1) * limit, page * limit).map((user) => (
        <Table.Tr
            key={user.id}
        // bg={selectedIds.includes(user.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                // checked={ }
                // onChange={() => setSelectedId(user.id)}
                />
            </Table.Td>

            <Table.Td>
                <Group wrap='nowrap'>
                    <Avatar />
                    <Box component="div">
                        <Text>{user.name}</Text>
                        <Text c='textSecondary.6'>{user.id}</Text>
                    </Box>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text>{user.email}</Text>
            </Table.Td>

            <Table.Td>
                <Badge color='background'>Владелец магазина</Badge>
            </Table.Td>

            <Table.Td>
                <Badge color="background">{user.status}</Badge>
            </Table.Td>

            <Table.Td>
                <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
            </Table.Td>

            <Table.Td>
                <Group justify="center">
                    <ActionIcon>
                        <IconEye />
                    </ActionIcon>

                    <ActionIcon>
                        <IconEdit />
                    </ActionIcon>

                    <ActionIcon>
                        <IconTrash />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Table.ScrollContainer minWidth={900} >
            <Table stickyHeader striped withTableBorder className={'users-table'} classNames={{ table: 'users-table__table' }}>
                <Table.Thead >
                    <Table.Tr>
                        <Table.Th>
                            <Checkbox
                                aria-label="Select all rows"
                            // checked={allUsersSelected}
                            // indeterminate={!allUsersSelected && somePageSelected}
                            // onChange={(e) => {
                            //     if (e.currentTarget.checked) {
                            //         setSelectedIds(Array.from(new Set([...selectedIds, ...usersIds])));
                            //     } else {
                            //         setSelectedIds(selectedIds.filter(id => !usersIds.includes(id)));
                            //     }
                            // }}
                            />
                        </Table.Th>
                        {tableHeadings.map(h => <Table.Th key={h}>{h}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{rows}</Table.Tbody>

                <Table.Tfoot>
                    <Table.Tr>
                        {/* +1 за колонку чекбокса */}
                        <Table.Td colSpan={tableHeadings.length + 1} >
                            <Group justify='space-between' p={'sm'}>
                                <Text size='lg' fw={500}>{users.length}/{users.length}</Text>
                                <Pagination total={Math.ceil(users.length / limit)} value={page} onChange={e => setSearchParams({ _page: e.toString() })} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer >

    );
}
