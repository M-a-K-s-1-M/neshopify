import { useSearchParams } from 'react-router-dom';
import type { IDomainRow } from '../mocks/domains';
import type { IUser } from '@/entities/user';
import { useEffect, useRef } from 'react';

export const useTable = (prefix: 'users' | 'domains' | 'users-mini' | 'domains-mini') => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page: number = searchParams.get(`${prefix}-table-page`) ? Number(searchParams.get(`${prefix}-table-page`)) : 1;
    const limit: number = 5;

    const roles = searchParams.get(`users-roles`) ?? undefined;

    const bannedParam = searchParams.get(`users-banned`);
    const banned = bannedParam === 'true' ? true : bannedParam === "false" ? false : undefined;

    const selectedIds: string[] = searchParams.get(`${prefix}-selected-ids`) ?
        searchParams.get(`${prefix}-selected-ids`)!.split(`,`).filter(Boolean)
        : [];

    const search: string | undefined = searchParams.get(`${prefix}-search`) ?? undefined;

    // const prevFilters = useRef({ search, roles, banned });

    // useEffect(() => {
    //     const prev = prevFilters.current;

    //     const filtersChanged =
    //         prev.search !== search ||
    //         prev.roles !== roles ||
    //         prev.banned !== banned;

    //     if (filtersChanged) {
    //         setSearchParams(searchParamsk => {
    //             const params = new URLSearchParams(searchParamsk);
    //             params.set(`${prefix}-table-page`, '1');
    //             return params;
    //         });
    //     }
    // })

    const onChangePagination = (e: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set(`${prefix}-table-page`, e.toString());
            return newParams;
        })
    }

    const isCheckedAll = (data: IUser[] | IDomainRow[]) => {
        return searchParams.get(`${prefix}-selected-ids`) ?
            searchParams.get(`${prefix}-selected-ids`)?.split(',').length === data.length
            : false
    }

    const isIndeterminate = (data: IUser[] | IDomainRow[]) => {
        const selectedCount = searchParams.get(`${prefix}-selected-ids`) ?
            searchParams.get(`${prefix}-selected-ids`)!.split(`,`).length
            : 0;
        return selectedCount > 0 && selectedCount < data.length;
    }

    const onChangeCeckbox = (entitiesId: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (selectedIds.includes(entitiesId)) {
                const newSelectedIds = selectedIds.filter(id => id !== entitiesId);
                if (newSelectedIds.length > 0) {
                    newParams.set(`${prefix}-selected-ids`, newSelectedIds.join(','));
                    return newParams;
                } else {
                    newParams.delete(`${prefix}-selected-ids`);
                    return newParams;
                }
            } else {
                const newSelectedIds = [...selectedIds, entitiesId];
                newParams.set(`${prefix}-selected-ids`, newSelectedIds.join(','));
                return newParams;
            }
        })
    }

    const onChangeCeckboxAll = (e: React.ChangeEvent<HTMLInputElement>, data: IUser[] | IDomainRow[]) => {
        if (e.target.checked) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set(`${prefix}-selected-ids`, data.map(u => u.id).join(','));
                return newParams;
            })
        } else {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete(`${prefix}-selected-ids`);
                return newParams;
            })
        }
    }

    return {
        roles,
        banned,
        page,
        limit,
        search,
        selectedIds,
        onChangePagination,
        onChangeCeckbox,
        onChangeCeckboxAll,
        isCheckedAll,
        isIndeterminate,
    }
}