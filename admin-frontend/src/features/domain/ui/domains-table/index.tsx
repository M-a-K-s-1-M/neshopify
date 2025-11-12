import { useTable } from "@/shared/hooks/useTable";
import { getDomains } from "@/shared";
import { Table, Checkbox, Group, Avatar, Box, Text, Badge, Pagination, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash, IconSettings } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

const tableHeadings = ['Домен', 'Почта', 'Статус', 'Тип', 'SSL', 'Действия'];

export function DomainsTable() {
    const { page, limit, selectedIds,
        search, pageStart, pageEnd,
        onChangePagination, onChangeCeckbox, onChangeCeckboxAll,
        isCheckedAll, isIndeterminate
    } = useTable('domains');

    const { data: domains, isPending, isError } = useQuery({
        queryKey: ['users-table', search],
        queryFn: () => getDomains({ search }),
    });

    if (isPending) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка загрузки пользователей</div>;
    }

    const rows = domains?.slice(pageStart, pageEnd).map((domain) => (
        <Table.Tr
            key={domain.id}
            bg={selectedIds.includes(domain.id) ? 'var(--mantine-color-blue-light)' : undefined}
        >
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedIds.includes(domain.id)}
                    onChange={() => onChangeCeckbox(domain.id)}
                />
            </Table.Td>

            <Table.Td>
                <Group wrap='nowrap'>
                    <Avatar />
                    <Box component="div">
                        <Text>{domain.domain}</Text>
                    </Box>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text>{domain.ownerEmail}</Text>
                <Text c='textSecondary.6'>ID: {domain.id}</Text>

            </Table.Td>

            <Table.Td>
                <Badge color='background'>{domain.status}</Badge>
            </Table.Td>

            <Table.Td>
                <Badge color="background">Пользовательский</Badge>
            </Table.Td>

            <Table.Td>
                <Text>{new Date(domain.expiresAt).toLocaleDateString()}</Text>
            </Table.Td>

            <Table.Td>
                <Group justify="center">

                    <ActionIcon>
                        <IconEdit />
                    </ActionIcon>

                    <ActionIcon>
                        <IconSettings />
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
            <Table stickyHeader striped withTableBorder className={'domains-table'} classNames={{ table: 'domains-table__table' }}>
                <Table.Thead >
                    <Table.Tr>
                        <Table.Th>
                            <Checkbox
                                aria-label="Select all rows"
                                checked={isCheckedAll(domains)}
                                indeterminate={isIndeterminate(domains)}
                                onChange={(e) => onChangeCeckboxAll(e, domains)}
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
                                <Text size='lg' fw={500}>{selectedIds.length ?? 0}/{domains.length}</Text>
                                <Pagination total={Math.ceil(domains.length / limit)} value={page} onChange={e => onChangePagination(e)} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </Table.ScrollContainer >
    );
}
