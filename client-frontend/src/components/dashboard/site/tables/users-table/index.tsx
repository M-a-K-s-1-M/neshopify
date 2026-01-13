'use client'
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components';
import { SiteUsersApi } from '@/lib/api/site-users';
import type { PaginatedResponse, SiteUserDto } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type UsersListState = {
    data: SiteUserDto[];
    meta: PaginatedResponse<SiteUserDto>['meta'];
};

function formatPublicUserId(userId: string): string {
    const short = userId?.slice(0, 8) ?? '';
    return `#${short || userId}`;
}

function formatDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
}

function formatStatus(banned: boolean): string {
    return banned ? 'Заблокирован' : 'Активен';
}

export function UsersTable() {
    const params = useParams();
    const siteId = typeof params.siteId === 'string' ? params.siteId : params.siteId?.[0];

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [status, setStatus] = useState<'ALL' | 'active' | 'suspended'>('ALL');
    const [lastActiveDate, setLastActiveDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UsersListState>({
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
                const res = await SiteUsersApi.list(siteId, {
                    page,
                    limit,
                    search: search.trim() || undefined,
                    status: status === 'ALL' ? undefined : status,
                    lastActiveFrom: lastActiveDate || undefined,
                    lastActiveTo: lastActiveDate || undefined,
                });
                if (!cancelled) {
                    setResult({ data: res.data ?? [], meta: res.meta });
                }
            } catch {
                if (!cancelled) setError('Не удалось загрузить пользователей.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [siteId, page, limit, search, status, lastActiveDate]);

    const rows = useMemo(() => {
        return (result.data ?? []).map((u) => ({
            rawId: u.id,
            id: formatPublicUserId(u.id),
            email: u.email,
            status: formatStatus(Boolean(u.banned)),
            lastActive: formatDate(u.updatedAt),
        }));
    }, [result.data]);

    const pageCount = Math.max(1, Math.ceil((result.meta?.total ?? 0) / (result.meta?.limit ?? limit)));
    const canPrev = page > 1;
    const canNext = page < pageCount;

    return (
        <div className='w-full'>
            {loading ? <div className='py-2 text-sm text-muted-foreground'>Загрузка пользователей…</div> : null}
            {error ? <div className='py-2 text-sm text-destructive'>{error}</div> : null}

            <div className='flex items-center py-4 gap-3 flex-wrap'>
                <Input
                    placeholder='Поиск по email...'
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className='max-w-sm'
                />

                <Select
                    value={status}
                    onValueChange={(v) => {
                        setStatus(v as 'ALL' | 'active' | 'suspended');
                        setPage(1);
                    }}
                >
                    <SelectTrigger className='w-[170px]'>
                        <SelectValue placeholder='Статус' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL'>Все статусы</SelectItem>
                        <SelectItem value='active'>Активен</SelectItem>
                        <SelectItem value='suspended'>Заблокирован</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type='date'
                    value={lastActiveDate}
                    onChange={(e) => {
                        setLastActiveDate(e.target.value);
                        setPage(1);
                    }}
                    className='w-[190px]'
                />

                <Button
                    variant='secondary'
                    onClick={() => {
                        setSearch('');
                        setStatus('ALL');
                        setLastActiveDate('');
                        setPage(1);
                    }}
                >
                    Сбросить
                </Button>
            </div>

            <div className='bg-sidebar overflow-hidden rounded-sm border shadow-md'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Последняя активность</TableHead>
                            <TableHead className='w-12' />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rows.length ? (
                            rows.map((u) => (
                                <TableRow key={u.rawId}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell className='text-muted-foreground'>{u.email}</TableCell>
                                    <TableCell>{u.status}</TableCell>
                                    <TableCell>{u.lastActive}</TableCell>
                                    <TableCell className='text-right'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align='end' className='p-2'>
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <Separator />
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.rawId)}>
                                                    Копировать ID
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.email)}>
                                                    Скопировать email
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className='h-24 text-center'>
                                    {loading
                                        ? 'Загрузка...'
                                        : error
                                            ? 'Не удалось загрузить пользователей.'
                                            : 'Нет данных для отображения.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrev}
                    >
                        Назад
                    </Button>
                    <span className='text-sm text-muted-foreground'>
                        {page} / {pageCount}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={!canNext}
                    >
                        Вперед
                    </Button>
                </div>
            </div>
        </div>
    );
}
