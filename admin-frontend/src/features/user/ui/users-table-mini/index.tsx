import { Avatar, Badge, Box, Button, Group, Table, Text, Pagination, Skeleton } from "@mantine/core";
import './styles.scss';
import { useQuery } from "@tanstack/react-query";
import { useTable } from "@/shared/hooks";
import { UsersService } from "@/shared";

const tableHeading: string[] = ['Пользователь', 'Сайтов', 'Статус', 'Действия']


export function UsersTableMini() {
    const { page, limit,
        search, pageStart, pageEnd,
        onChangePagination,
    } = useTable('users-mini');

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users-mini-table', search],
        queryFn: async () => await UsersService.getAll(),
    });

    if (isPending) {
        return <Skeleton height={400} radius={'md'} />
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
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
                    {users?.slice(pageStart, pageEnd).map(user =>
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
                                <Badge color="background">
                                    {user.status ?? 'Активен/заблокирован'}
                                </Badge>
                            </Table.Td>

                            <Table.Td>
                                <Group justify='center' >
                                    <Button variant="outline" color={'button'}>Редактировать</Button>
                                    <Button variant="outline" color={"button"} >Заблокировать</Button>
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
                                    total={Math.ceil((users?.length || 0) / limit)}
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
