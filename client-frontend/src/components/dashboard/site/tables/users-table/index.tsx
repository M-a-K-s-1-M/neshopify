'use client'
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, Input, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export type PlatformUser = {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'invited' | 'suspended';
    lastActive: string;
};

export const data: PlatformUser[] = [
    {
        id: 'USR-101',
        name: 'Алексей Иванов',
        email: 'alexey.ivanov@example.com',
        status: 'active',
        lastActive: '2025-01-15T09:42:00Z',
    },
    {
        id: 'USR-102',
        name: 'Мария Соколова',
        email: 'maria.sokolova@example.com',
        status: 'active',
        lastActive: '2025-01-14T17:10:00Z',
    },
    {
        id: 'USR-103',
        name: 'Дмитрий Афанасьев',
        email: 'd.afanasiev@example.com',
        status: 'invited',
        lastActive: '2025-01-10T12:00:00Z',
    },
    {
        id: 'USR-104',
        name: 'Екатерина Власова',
        email: 'ekaterina.vlasova@example.com',
        status: 'suspended',
        lastActive: '2024-12-28T08:20:00Z',
    },
    {
        id: 'USR-105',
        name: 'Никита Романов',
        email: 'nikita.romanov@example.com',
        status: 'active',
        lastActive: '2025-01-16T06:55:00Z',
    },
    {
        id: 'USR-106',
        name: 'София Андреева',
        email: 'sofia.andreeva@example.com',
        status: 'invited',
        lastActive: '2025-01-12T14:25:00Z',
    },
    {
        id: 'USR-107',
        name: 'Илья Чернов',
        email: 'ilya.chernov@example.com',
        status: 'active',
        lastActive: '2025-01-13T11:05:00Z',
    },
    {
        id: 'USR-108',
        name: 'Ольга Миронова',
        email: 'olga.mironova@example.com',
        status: 'suspended',
        lastActive: '2024-12-30T19:40:00Z',
    },
    {
        id: 'USR-109',
        name: 'Виктор Ли',
        email: 'victor.li@example.com',
        status: 'active',
        lastActive: '2025-01-11T08:15:00Z',
    },
    {
        id: 'USR-110',
        name: 'Анна Корнеева',
        email: 'anna.korneeva@example.com',
        status: 'invited',
        lastActive: '2025-01-09T16:32:00Z',
    },
];

const columns: ColumnDef<PlatformUser>[] = [
    {
        accessorKey: 'id',
        header: 'ID пользователя',
        cell: ({ row }) => <span className="font-medium">{row.getValue('id')}</span>,
    },
    {
        accessorKey: 'name',
        filterFn: 'includesString',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Имя
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <span>{row.getValue('name')}</span>,
    },
    {
        accessorKey: 'email',
        filterFn: 'includesString',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Email
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('email')}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Статус',
        filterFn: 'includesString',
        cell: ({ row }) => {
            const value = row.getValue<string>('status');
            const labelMap: Record<PlatformUser['status'], string> = {
                active: 'Активен',
                invited: 'Приглашён',
                suspended: 'Заблокирован',
            };

            return (
                <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize text-muted-foreground">
                    {labelMap[value as PlatformUser['status']]}
                </span>
            );
        },
    },
    {
        accessorKey: 'lastActive',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Последняя активность
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => {
            const value = row.getValue<string>('lastActive');
            const formatted = new Date(value).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            return <span>{formatted}</span>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="p-2">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>

                        <Separator />

                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                            Скопировать email
                        </DropdownMenuItem>
                        <DropdownMenuItem>Открыть профиль</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];


export function UsersTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    })

    return (
        <div className='w-full'>
            <div className='flex items-center py-4'>
                <Input
                    placeholder='Поиск по пользователю...'
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
                    className='max-w-sm'
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='secondary' className='ml-auto'>
                            Колонки <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end'>
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className='bg-sidebar overflow-hidden rounded-sm border shadow-md'>
                <Table >
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    Нет данных для отображения.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Вперед
                    </Button>
                </div>
            </div>
        </div>
    )
}
