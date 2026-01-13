'use client'
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Input,
    Separator,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { SiteOrdersApi } from '@/lib/api/orders';
import type { OrderDto, OrderStatus, PaginatedResponse } from '@/lib/types';

type OrdersListState = {
    data: OrderDto[];
    meta: PaginatedResponse<OrderDto>['meta'];
};

function formatOrderStatus(status: OrderStatus): string {
    switch (status) {
        case 'FULFILLED':
            return 'Доставлен';
        case 'CONFIRMED':
            return 'В пути';
        case 'PENDING':
            return 'Обработка';
        case 'CANCELLED':
            return 'Отменен';
        case 'DRAFT':
            return 'Черновик';
        default:
            return status;
    }
}

function formatDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
}

function formatAmount(value: unknown): string {
    const n = typeof value === 'number' ? value : Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

function formatCustomer(order: OrderDto): string {
    return (
        order.customerEmail ||
        order.customerPhone ||
        (order.userId ? `user:${order.userId.slice(0, 8)}` : '—')
    );
}

function formatPublicOrderId(orderId: string): string {
    const short = orderId?.slice(0, 8) ?? '';
    return `#${short || orderId}`;
}
export function OrdersTable() {
    const params = useParams();
    const siteId = typeof params.siteId === 'string' ? params.siteId : params.siteId?.[0];

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<OrdersListState>({
        data: [],
        meta: { total: 0, page: 1, limit },
    });

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!siteId) return;
            setLoading(true);
            setError(null);
            try {
                const res = await SiteOrdersApi.list(siteId, {
                    page,
                    limit,
                    search: search.trim() || undefined,
                    includeItems: 'false',
                });
                if (!cancelled) {
                    setResult({ data: res.data ?? [], meta: res.meta });
                }
            } catch {
                if (!cancelled) setError('Не удалось загрузить заказы.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [siteId, page, limit, search]);

    const rows = useMemo(() => {
        return (result.data ?? []).map((o) => ({
            id: formatPublicOrderId(o.id),
            rawId: o.id,
            customer: formatCustomer(o),
            date: formatDate(o.createdAt),
            status: formatOrderStatus(o.status),
            amount: formatAmount(o.total),
        }));
    }, [result.data]);

    const pageCount = Math.max(1, Math.ceil((result.meta?.total ?? 0) / (result.meta?.limit ?? limit)));
    const canPrev = page > 1;
    const canNext = page < pageCount;

    return (
        <div className='w-full'>
            {loading ? (
                <div className='py-2 text-sm text-muted-foreground'>Загрузка заказов…</div>
            ) : null}
            {error ? (
                <div className='py-2 text-sm text-destructive'>{error}</div>
            ) : null}
            <div className='flex items-center py-4'>
                <Input
                    placeholder='Поиск по клиенту...'
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className='max-w-sm'
                />
            </div>

            <div className='bg-sidebar overflow-hidden rounded-sm border shadow-md'>
                <Table >
                    <TableHeader>
                        <TableRow>
                            <TableHead>Заказ ID</TableHead>
                            <TableHead>
                                Клиент
                            </TableHead>
                            <TableHead>
                                Дата
                            </TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>
                                Сумма
                            </TableHead>
                            <TableHead className='w-12' />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.length ? (
                            rows.map((o) => (
                                <TableRow key={o.rawId}>
                                    <TableCell>{o.id}</TableCell>
                                    <TableCell>{o.customer}</TableCell>
                                    <TableCell>{o.date}</TableCell>
                                    <TableCell>{o.status}</TableCell>
                                    <TableCell>{o.amount}</TableCell>
                                    <TableCell className='text-right'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className='h-8 w-8 p-0'>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align='end' className='p-2'>
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <Separator />
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(o.rawId)}>
                                                    Копировать ID заказа
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className='h-24 text-center'>
                                    {loading ? 'Загрузка...' : error ? 'Не удалось загрузить заказы.' : 'Нет данных для отображения.'}
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
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrev}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={!canNext}
                    >
                        Вперед
                    </Button>
                </div>
            </div>
        </div>
    )
}
