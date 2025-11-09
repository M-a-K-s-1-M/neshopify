import { useState } from 'react';
import { Table, Checkbox, Pagination, Group, Avatar, Box, Text, Badge, ActionIcon } from '@mantine/core';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import './sytels.scss';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user';
import { getUsers, } from '@/shared';

// Заголовки (кроме колонки чекбокса). Используем для вычисления colSpan футера.
const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

export function UsersTable() {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const { filters } = useUserStore();

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users', filters],
        queryFn: () => getUsers(filters),
    })

    const total = users;
    const limit = filters?.limit || 5;
    const pageCount = total ? Math.ceil(total.length / limit) : 0;


    if (isPending) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    const rows = users?.map((user) => (
        <Table.Tr
            key={user.id}
            bg={selectedRows.includes(user.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedRows.includes(user.id)}
                    onChange={(event) =>
                        setSelectedRows(
                            event.currentTarget.checked
                                ? [...selectedRows, user.id]
                                : selectedRows.filter((userId) => userId !== user.id)
                        )
                    }
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
                                onChange={(event) =>
                                    setSelectedRows(
                                        event.currentTarget.checked
                                            ? users.map((user) => user.id)
                                            : []
                                    )
                                }
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
                                <Text size='lg' fw={500}>{selectedRows.length}/{total?.length ?? 0}</Text>
                                <Pagination total={pageCount} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer>

    );
}
