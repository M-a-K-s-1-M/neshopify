import { Avatar, Badge, Box, Button, Group, Table, Text, Pagination } from "@mantine/core";
import './styles.scss';
import { getUsers } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useTable } from "@/shared/hooks";

const tableHeading: string[] = ['Пользователь', 'Тариф', 'Сайтов', 'Статус', 'Действия']


export function UsersTableMini() {
    const { page, limit,
        search, pageStart, pageEnd,
        onChangePagination,
    } = useTable('users-mini');

    const { data: users, isPending, isError } = useQuery({
        queryKey: ['users-mini-table', search],
        queryFn: () => getUsers({ search }),
    });

    if (isPending) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    return (
        <Table.ScrollContainer minWidth={900}>
            <Table stickyHeader striped withTableBorder className={'users-table-mini'} classNames={{ table: 'users-table-mini__table' }}>
                <Table.Thead>
                    <Table.Tr>
                        {tableHeading?.map(tableHeading => <Table.Th ta={tableHeading === 'Действия' ? 'center' : 'left'} key={tableHeading}>{tableHeading}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {users?.slice(pageStart, pageEnd).map(user =>
                        <Table.Tr key={user.id}>
                            <Table.Td>
                                <Group >
                                    <Avatar />
                                    <Box component="div">
                                        <Text>{user.name}</Text>
                                        <Text c='textSecondary.6'>{user.email}</Text>
                                    </Box>
                                </Group>
                            </Table.Td>

                            <Table.Td>
                                <Text>{user.plan}</Text>
                            </Table.Td>

                            <Table.Td >
                                <Text>{user.sites} </Text>
                            </Table.Td>

                            <Table.Td>
                                <Badge color="background">
                                    {user.status}
                                </Badge>
                            </Table.Td>

                            <Table.Td>
                                <Group justify="center">
                                    <Button variant="outline" color={'button'}>Редактировать</Button>
                                    <Button variant="outline" color={"button"} >Заблокировать</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>

                <Table.Tfoot>
                    <Table.Tr>
                        {/* +1 за колонку чекбокса */}
                        <Table.Td colSpan={tableHeading.length} >
                            <Group justify='center' p={'sm'}>
                                <Pagination total={Math.ceil((users?.length || 0) / limit)} value={page} onChange={e => onChangePagination(e)} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>

            </Table>
        </Table.ScrollContainer>
    )
}
