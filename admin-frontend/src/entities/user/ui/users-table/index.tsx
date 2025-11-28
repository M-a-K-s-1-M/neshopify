import { Table, Checkbox, Pagination, Group, Avatar, Box, Text, Badge, ActionIcon, Skeleton, Stack } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import './sytels.scss';
import { useQuery } from '@tanstack/react-query';
import { useTable } from '@/shared/hooks';
import { UsersService } from '@/shared';
import { DeleteUserIcon, EditUserIcon } from '@/features';

// Заголовки (кроме колонки чекбокса). Используем для вычисления colSpan футера.
const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

export function UsersTable() {
    const { page, limit, selectedIds,
        search, pageStart, pageEnd,
        onChangePagination, onChangeCeckbox, onChangeCeckboxAll,
        isCheckedAll, isIndeterminate
    } = useTable('users');

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users-table', search],
        queryFn: async () => await UsersService.getAll(),
    });

    if (isPending) {
        return <Skeleton height={400} radius="md" />;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    const rows = users.slice(pageStart, pageEnd).map((user) => (
        <Table.Tr
            key={user.id}
            bg={selectedIds.includes(user.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => onChangeCeckbox(user.id)}
                />
            </Table.Td>

            <Table.Td>
                <Group wrap='nowrap'>
                    <Avatar />
                    <Box component="div">
                        <Text fw={500}>{user.email}</Text>
                        <Text c='textSecondary.6'>ID: {user.id}</Text>
                    </Box>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text>{user.email}</Text>
            </Table.Td>

            <Table.Td w={150}>
                <Stack>
                    {user.userRoles.map((userRole, i) => <Badge key={i} color='background'>{userRole.role?.value}</Badge>)}
                </Stack>
            </Table.Td>

            <Table.Td w={150}>
                <Badge color="background">Активный/Забанен</Badge>
            </Table.Td>

            <Table.Td>
                <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
            </Table.Td>

            <Table.Td>
                <Group justify="center">
                    <ActionIcon>
                        <IconEye />
                    </ActionIcon>

                    <EditUserIcon user={user} />

                    <DeleteUserIcon user={user} />
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
                                checked={isCheckedAll(users)}
                                indeterminate={isIndeterminate(users)}
                                onChange={(e) => onChangeCeckboxAll(e, users)}
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
                                <Text size='lg' fw={500}>{selectedIds.length ?? 0}/{users.length}</Text>
                                <Pagination total={Math.ceil(users.length / limit)} value={page} onChange={e => onChangePagination(e)} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer >
    );
}
