import type { IUserRow } from "@/shared/mocks/users";
import { Avatar, Badge, Box, Button, Group, Table, Text } from "@mantine/core";
import './styles.scss';

const tableHeading: string[] = ['Пользователь', 'Тариф', 'Сайтов', 'Статус', 'Действия']


export function UsersTableMini({ data }: { data: IUserRow[] }) {

    return (
        <Table.ScrollContainer minWidth={900}>
            <Table stickyHeader striped withTableBorder className={'users-table-mini'} classNames={{ table: 'users-table-mini__table' }}>
                <Table.Thead>
                    <Table.Tr>
                        {tableHeading?.map(tableHeading => <Table.Th ta={tableHeading === 'Действия' ? 'center' : 'left'} key={tableHeading}>{tableHeading}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {data?.map(user =>
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
            </Table>
        </Table.ScrollContainer>
    )
}
