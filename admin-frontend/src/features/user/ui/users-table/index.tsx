import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Checkbox, Pagination, Group, Avatar, Box, Text, Badge, ActionIcon } from '@mantine/core';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import './sytels.scss';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user';
import { useUsersTable } from '@/entities/user/model/stores/useUsersTable';
import { getUsers, } from '@/shared';

// Заголовки (кроме колонки чекбокса). Используем для вычисления colSpan футера.
const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

export function UsersTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { filters } = useUserStore();

    console.log(searchParams);

    // Стор таблицы
    const {
        page, limit, setPage, setLimit,
        selectedIds, setSelectedId, setSelectedIds,
        search, setSearch,
    } = useUsersTable();

    // Синхронизация с URL при монтировании
    useEffect(() => {
        const urlPage = parseInt(searchParams.get('table_page') || '1', 10);
        const urlLimit = parseInt(searchParams.get('table_limit') || '5', 10);
        const urlSearch = searchParams.get('table_search') || '';

        setPage(urlPage);
        setLimit(urlLimit);

        if (search !== '') setSearch(urlSearch);


    }, [searchParams, setPage, setLimit, setSearch]);

    // Синхронизация в URL при изменениях
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set('table_page', page.toString());
        params.set('table_limit', limit.toString());

        if (search !== '') params.set('table_search', search);

        setSearchParams(params, { replace: true });
    }, [page, limit, search, setSearchParams, searchParams]);

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users', filters],
        queryFn: () => getUsers(filters),
    })

    const all = users ?? [];
    const pageCount = Math.ceil(all.length / limit) || 1;
    const start = (page - 1) * limit;
    const pageUsers = all.slice(start, start + limit);
    const usersIds = all.map(u => u.id);
    const allUsersSelected = all.length > 0 && all.every(u => selectedIds.includes(u.id));
    const somePageSelected = all.some(u => selectedIds.includes(u.id));

    // Сброс страницы при смене фильтров или данных
    useEffect(() => {
        setPage(1);
    }, [filters, all.length, setPage]);

    if (isPending) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    const rows = pageUsers.map((user) => (
        <Table.Tr
            key={user.id}
            bg={selectedIds.includes(user.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => setSelectedId(user.id)}
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
                                checked={allUsersSelected}
                                indeterminate={!allUsersSelected && somePageSelected}
                                onChange={(e) => {
                                    if (e.currentTarget.checked) {
                                        setSelectedIds(Array.from(new Set([...selectedIds, ...usersIds])));
                                    } else {
                                        setSelectedIds(selectedIds.filter(id => !usersIds.includes(id)));
                                    }
                                }}
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
                                <Text size='lg' fw={500}>{selectedIds.length}/{all.length}</Text>
                                <Pagination total={pageCount} value={page} onChange={setPage} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer>

    );
}
