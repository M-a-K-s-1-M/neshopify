'use client'
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, Input, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export type LastOrder = {
    id: string;            // #ORD-2547
    customer: string;      // Имя клиента
    avatar: string;        // URL или идентификатор аватара
    date: string;          // ISO или форматированная дата
    status: "Доставлен" | "В пути" | "Обработка";
    amount: string;        // ₽8,450
};

export const data: LastOrder[] = [
    {
        id: "#ORD-2547asdf",
        customer: "Мария Петрова",
        avatar: "/images/avatars/maria.svg",
        date: "2025-01-15",
        status: "Доставлен",
        amount: "8,450",
    },
    {
        id: "#ORD-2546fff",
        customer: "Дмитрий Козлов",
        avatar: "/images/avatars/dmitry.svg",
        date: "2025-01-15",
        status: "В пути",
        amount: "12,890",
    },
    {
        id: "#ORD-254523423",
        customer: "Елена Смирнова",
        avatar: "/images/avatars/elena.svg",
        date: "2025-01-14",
        status: "Обработка",
        amount: "5,670",
    },
    {
        id: "#ORD-2547asdf",
        customer: "Мария Петрова",
        avatar: "/images/avatars/maria.svg",
        date: "2025-01-15",
        status: "Доставлен",
        amount: "8,450",
    },
    {
        id: "#ORD-2546gghwe22",
        customer: "Дмитрий Козлов",
        avatar: "/images/avatars/dmitry.svg",
        date: "2025-01-15",
        status: "В пути",
        amount: "12,890",
    },
    {
        id: "#ORD-2545",
        customer: "Елена Смирнова",
        avatar: "/images/avatars/elena.svg",
        date: "2025-01-14",
        status: "Обработка",
        amount: "5,670",
    },
    {
        id: "#ORD-2547",
        customer: "Мария Петрова",
        avatar: "/images/avatars/maria.svg",
        date: "2025-01-15",
        status: "Доставлен",
        amount: "8,450",
    },
    {
        id: "#ORD-2546",
        customer: "Дмитрий Козлов",
        avatar: "/images/avatars/dmitry.svg",
        date: "2025-01-15",
        status: "В пути",
        amount: "12,890",
    },
    {
        id: "#ORD-2545",
        customer: "Елена Смирнова",
        avatar: "/images/avatars/elena.svg",
        date: "2025-01-14",
        status: "Обработка",
        amount: "5,670",
    },
];

const columns: ColumnDef<LastOrder>[] = [
    {
        accessorKey: 'id',
        header: "Заказ ID",
        cell: ({ row }) => (
            <div>{row.getValue('id')}</div>
        )
    },
    {
        accessorKey: 'customer',
        filterFn: 'includesString',
        header: ({ column }) => {
            return (
                <Button variant={'ghost'} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Клиент
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div>{row.getValue('customer')}</div>
        )
    },
    {
        accessorKey: 'date',
        filterFn: 'includesString',
        header: ({ column }) => {
            return (
                <Button variant={'ghost'} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Дата
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div>{row.getValue('date')}</div>
        )
    },
    {
        accessorKey: 'status',
        header: "Статус",
        filterFn: 'includesString',
        cell: ({ row }) => <div>{row.getValue('status')}</div>
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => {
            return (
                <Button variant={'ghost'} onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Сумма
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div>{row.getValue('amount')}</div>
        )
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const orders = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className='h-8 w-8 p-0'>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end' className='p-2'>
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>

                        <Separator />

                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(orders.id)}>
                            Копировать ID заказа
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Просмотреть пользователя
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]


export function OrdersTable() {
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
                pageSize: 3,
            },
        },
    })

    return (
        <div className='w-full'>
            <div className='flex items-center py-4'>
                <Input
                    placeholder='Поиск по клиенту...'
                    value={(table.getColumn('customer')?.getFilterValue() as string) ?? ''}
                    onChange={e => table.getColumn('customer')?.setFilterValue(e.target.value)}
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
                        Previous
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
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
