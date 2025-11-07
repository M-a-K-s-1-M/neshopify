import type { IDomainRow } from "@/shared/mocks/domains";
import { Badge, Button, Group, Table, Text } from "@mantine/core";
import { format } from 'date-fns';
import './styles.scss';

const tableHeading: string[] = ['Домен', 'Владелец', 'Статус', 'Истекает', 'Действия']

export function DomainsTableMini({ data }: { data: IDomainRow[] }) {
    return (
        <Table.ScrollContainer minWidth={900}>
            <Table stickyHeader striped withTableBorder className="domains-table-mini" classNames={{ table: 'domains-table-mini__table' }}>
                <Table.Thead>
                    <Table.Tr>
                        {tableHeading?.map(tableHeading => <Table.Th ta={tableHeading === 'Действия' ? 'center' : 'left'} key={tableHeading}>{tableHeading}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {data?.map(domain =>
                        <Table.Tr key={domain.id}>
                            <Table.Td>
                                <Text>{domain.domain}</Text>
                            </Table.Td>

                            <Table.Td>
                                <Text>{domain.ownerEmail}</Text>
                            </Table.Td>

                            <Table.Td>
                                <Badge color="background">{domain.status}</Badge>
                            </Table.Td>

                            <Table.Td>
                                <Text>{format(domain.expiresAt, 'dd.MM.yy')}</Text>
                            </Table.Td>

                            <Table.Td>
                                <Group justify="center">
                                    <Button variant="outline" color={'button'}>Продлить</Button>
                                    <Button variant="outline" color={"button"} >Настроить</Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    )}

                </Table.Tbody>
            </Table>
        </Table.ScrollContainer >
    )
}
