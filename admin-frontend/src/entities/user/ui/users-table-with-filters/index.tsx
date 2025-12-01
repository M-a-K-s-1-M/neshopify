import { BlockErrorTable, UsersService } from "@/shared";
import { Avatar, Box, Group, Skeleton, Table, Text, } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table';
import { useState } from "react";
import type { IUser } from "../../models";
import { SearchWithFilters } from "./ui";

// const tableHeadings = ['Пользователь', 'Email', 'Роль', 'Статус', 'Последний вход', 'Действия'];

const columnHelper = createColumnHelper<IUser>();

// const columns = [
//     {
//         header: "Пользователь",
//         accessorKey: "user",
//     },
//     {
//         header: "email",
//         accessorKey: "email",
//     },
//     {
//         header: "Роль",
//         accessorKey: 'role',
//         accessorFn: (row) => row.userRole.role;
//     },
//     {
//         header: "Статус",
//         accessorKey: 'banned',
//     },
//     {
//         header: 'Дата создания',
//         accessorKey: 'createdAt',
//     },
//     {
//         header: 'Действия',
//         accessorKey: 'actions',
//     }
// ];

const columns = [
    columnHelper.display({

    })
]

export function UsersTableWithFilters() {
    const [sortingCreatedAt, setSortingCreatedAt] = useState<SortingState>([]);

    const { data, isPending, isError } = useQuery({
        queryKey: ["users-table"],
        queryFn: async () => await UsersService.getAll({ limit: 5 })
    })

    const dataTable = data ? [...data.users] : [];

    const table = useReactTable({
        data: dataTable,
        columns,

        getCoreRowModel: getCoreRowModel(),

        state: { sorting: sortingCreatedAt },
        onSortingChange: setSortingCreatedAt,
        getSortedRowModel: getSortedRowModel(),
    })

    if (isPending) {
        return <Skeleton height={400} radius="md" />;
    }

    if (isError || !data) {
        return <BlockErrorTable message='Ошибка загрузки пользователей' />
    }

    return (
        <>
            <SearchWithFilters />

            <Table.ScrollContainer minWidth={900}>
                <Table stickyHeader striped withTableBorder className={'users-table'} classNames={{ table: 'users-table__table' }}>
                    <Table.Thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <Table.Th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>

                    <Table.Tbody>
                        {table.getRowModel().rows.map(row => (
                            <Table.Tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <Table.Td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>

                </Table>
            </Table.ScrollContainer>
        </>
    )
}
