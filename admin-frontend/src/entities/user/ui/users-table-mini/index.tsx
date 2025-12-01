import { Avatar, Badge, Box, Group, Table, Text, Pagination, Skeleton } from "@mantine/core";
import './styles.scss';
import { useQuery } from "@tanstack/react-query";
import { useTable } from "@/shared/hooks";
import { BlockErrorTable, UsersService } from "@/shared";
import { BannedUserButton, EditUserButton, UnbannedUserButton } from "@/features";

const tableHeading: string[] = ['Пользователь', 'Сайтов', 'Статус', 'Действия']


export function UsersTableMini() {
    const {
        page,
        limit,
        search,
        onChangePagination,
    } = useTable('users-mini');

    const { data, isPending, isError } = useQuery({
        queryKey: ['users-mini-table', page, search],
        queryFn: async () => await UsersService.getAll({ limit, page, search }),
        placeholderData: (prev) => prev,
        refetchOnReconnect: true,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
    });

    if (isPending) {
        return <Skeleton height={400} radius={'md'} />
    }

    if (isError) {
        return <BlockErrorTable message='Ошибка загрузки пользователей' />
    }

    return (
        <Table.ScrollContainer minWidth={900}>
            <Table
                stickyHeader
                striped
                withTableBorder
                className={'users-table-mini'}
                classNames={{ table: 'users-table-mini__table' }}
            >
                <Table.Thead>
                    <Table.Tr>
                        {tableHeading?.map(tableHeading =>
                            <Table.Th
                                ta={tableHeading === 'Действия'
                                    || tableHeading === 'Сайтов'
                                    || tableHeading === 'Статус'
                                    ? 'center'
                                    : 'left'}
                                key={tableHeading}
                            >
                                {tableHeading}
                            </Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {data.users.map(user =>
                        <Table.Tr key={user.id}>
                            <Table.Td>
                                <Group >
                                    <Avatar />
                                    <Box component="div">
                                        <Text>{user.email}</Text>
                                        <Text c='textSecondary.6' >ID: {user.id}</Text>
                                    </Box>
                                </Group>
                            </Table.Td>

                            <Table.Td >
                                <Text ta={'center'}>{user.sites ?? 0} </Text>
                            </Table.Td>

                            <Table.Td ta={'center'}>
                                {user.banned ? <Badge color="red">Заблокирован</Badge> : <Badge color="blue">Активный</Badge>}
                            </Table.Td>

                            <Table.Td>
                                <Group justify='center' >
                                    <EditUserButton user={user} />

                                    {user.banned ?
                                        <UnbannedUserButton user={user} />
                                        :
                                        <BannedUserButton user={user} />
                                    }
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>

                <Table.Tfoot>
                    <Table.Tr>
                        <Table.Td colSpan={tableHeading.length} >
                            <Group justify='center' p={'sm'}>
                                <Pagination
                                    total={data.pages}
                                    value={page}
                                    onChange={e => onChangePagination(e)}
                                />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>

            </Table>
        </Table.ScrollContainer >
    )
}
