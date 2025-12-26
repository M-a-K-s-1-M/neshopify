'use client'
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, Input, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrdersApi } from '@/lib/api/orders';
import { queryKeys } from '@/lib/query/keys';
import type { OrderDto } from '@/lib/types';

export type LastOrder = {
    id: string;            // #ORD-2547
    customer: string;      // Имя клиента
    avatar: string;        // URL или идентификатор аватара
    date: string;          // ISO или форматированная дата
    status: string;        // Статус доставки
    paymentStatus: string; // Статус оплаты
    amount: string;        // ₽8,450
};

function formatDeliveryStatus(status: OrderDto['status']) {
    switch (status) {
        case 'FULFILLED':
            return 'Доставлен';
        case 'CONFIRMED':
            return 'В пути';
        case 'CANCELLED':
            return 'Отменён';
        case 'DRAFT':
        case 'PENDING':
        default:
            return 'Обработка';
    }
}

function formatPaymentStatus(status: OrderDto['paymentStatus']) {
    switch (status) {
        case 'PAID':
            return 'Оплачен';
        case 'PENDING':
            return 'Ожидает подтверждения';
        case 'REFUNDED':
            return 'Возврат';
        case 'NOT_PAID':
        default:
            return 'Не оплачен';
    }
}

function formatMoney(amount: string | number) {
    const parsed = typeof amount === 'number' ? amount : Number(amount);
    const safe = Number.isFinite(parsed) ? parsed : 0;
    return safe.toLocaleString('ru-RU');
}

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
        header: "Статус доставки",
        filterFn: 'includesString',
        cell: ({ row }) => <div>{row.getValue('status')}</div>
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Статус оплаты',
        filterFn: 'includesString',
        cell: ({ row }) => <div>{row.getValue('paymentStatus')}</div>,
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


export function OrdersTable({ siteId }: { siteId: string }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const { data: ordersRes, isLoading, error } = useQuery({
        queryKey: queryKeys.siteOrdersList(siteId, { limit: 100 }),
        queryFn: () => OrdersApi.list(siteId, { limit: 100 }),
    });

    const tableData: LastOrder[] = useMemo(() => {
        const orders = ordersRes?.data ?? [];
        return orders.map((o) => ({
            id: o.id,
            customer: o.customerEmail || o.customerPhone || o.userId || '—',
            avatar: '',
            date: (o.createdAt ?? '').slice(0, 10),
            status: formatDeliveryStatus(o.status),
            paymentStatus: formatPaymentStatus(o.paymentStatus),
            amount: formatMoney(o.total),
        }));
    }, [ordersRes?.data]);

    const table = useReactTable({
        data: tableData,
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

            {isLoading ? (
                <div className='py-6 text-sm text-muted-foreground'>Загружаем заказы...</div>
            ) : error ? (
                <div className='py-6 text-sm text-destructive'>Не удалось загрузить заказы</div>
            ) : null}

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
