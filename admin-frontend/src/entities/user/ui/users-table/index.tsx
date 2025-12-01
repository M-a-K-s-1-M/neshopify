import { DeleteUserIcon, EditUserIcon } from "@/features";
import { BlockErrorTable, UsersService } from "@/shared";
import { ActionIcon, Avatar, Badge, Box, Checkbox, Group, Pagination, Skeleton, Stack, Table, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useUsersFilters } from "../../hooks";
import './sytels.scss';

const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

export function UsersTable() {

    const { page,
        limit,
        search,
        rolesInString,
        banned,
        bannedBoolean,
        selectedIdsArray,
        toggleAll,
        isCheckedAll,
        isIndeterminate,
        update
    } = useUsersFilters();

    const { data, isPending, isError } = useQuery({
        queryKey: ["users-table", page, limit, search, rolesInString, banned],
        queryFn: () => UsersService.getAll({
            page,
            limit,
            search: search || undefined,
            roles: rolesInString || undefined,
            banned: bannedBoolean, // undefined | true | false
        }),
        // пока загружаются новые данные — показываем предыдущие (placeholder)
        placeholderData: (prev) => prev,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
    });


    if (isPending) {
        return <Skeleton height={400} radius="md" />;
    }

    if (isError || !data) {
        return <BlockErrorTable message='Ошибка загрузки пользователей' />
    }


    const rows = data.users.map((user) => (
        <Table.Tr
            key={user.id}
            bg={selectedIdsArray.includes(user.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedIdsArray.includes(user.id)}
                    onChange={() => update('selectedIds', selectedIdsArray.includes(user.id) ? selectedIdsArray.filter(id => id !== user.id).join(',') : [...selectedIdsArray, user.id].join(','))}
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
                    {user.userRoles.map((userRole) => <Badge key={userRole.roleId} color='background'>{userRole.role?.value}</Badge>)}
                </Stack>
            </Table.Td>

            <Table.Td w={150}>
                {user.banned ? <Badge color="red">Заблокирован</Badge> : <Badge color="blue">Активный</Badge>}
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
                                checked={isCheckedAll(data.users)}
                                indeterminate={isIndeterminate(data.users)}
                                onChange={(e) => toggleAll(e.target.checked, data.users)}
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
                                <Text
                                    size='lg'
                                    fw={500}
                                >
                                    {selectedIdsArray.length ?? 0}/{data.total}
                                </Text>

                                <Pagination
                                    total={data.pages}
                                    value={page}
                                    onChange={e => update('page', e)}
                                />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer >
    );
}
