import { Badge, Button, Group, Pagination, Skeleton, Table, Text } from "@mantine/core";
import { format } from 'date-fns';
import './styles.scss';
import { useTable } from "@/shared/hooks";
import { useQuery } from "@tanstack/react-query";
import { getDomains } from "@/shared";

const tableHeading: string[] = ['Домен', 'Владелец', 'Статус', 'Истекает', 'Действия']

export function DomainsTableMini() {
    const { page, limit, pageEnd, pageStart, onChangePagination } = useTable('domains-mini')

    const { data: domains, isPending, isError } = useQuery({
        queryKey: ['domains-mini'],
        queryFn: () => getDomains(),
    })

    if (isPending) {
        return <Skeleton height={400} radius={'md'} />
    }

    if (isError) {
        return <div>Ошибка загрузки доменов</div>;
    }

    return (
        <Table.ScrollContainer minWidth={900}>
            <Table stickyHeader striped withTableBorder className="domains-table-mini" classNames={{ table: 'domains-table-mini__table' }}>
                <Table.Thead>
                    <Table.Tr>
                        {tableHeading?.map(tableHeading =>
                            <Table.Th ta={tableHeading === 'Действия' ? 'center' : 'left'} key={tableHeading}>
                                {tableHeading}
                            </Table.Th>)}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {domains?.slice(pageStart, pageEnd).map(domain =>
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

                <Table.Tfoot>
                    <Table.Tr>
                        <Table.Td colSpan={tableHeading.length}>
                            <Group p={'sm'} justify="center">
                                <Pagination
                                    total={Math.ceil((domains?.length || 0) / limit)}
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
