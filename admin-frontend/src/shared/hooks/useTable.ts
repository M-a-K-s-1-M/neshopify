import { useSearchParams } from 'react-router-dom';
import type { IDomainRow } from '../mocks/domains';
import type { IUser } from '@/entities/user';

export const useTable = (prefix: 'users' | 'domains' | 'users-mini' | 'domains-mini') => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page: number = searchParams.get(`${prefix}-table-page`) ? Number(searchParams.get(`${prefix}-table-page`)) : 1;
    const limit: number = 5;

    const pageStart: number = (page - 1) * limit;
    const pageEnd: number = pageStart + limit;

    const selectedIds: string[] = searchParams.get(`${prefix}-selected-ids`) ?
        searchParams.get(`${prefix}-selected-ids`)!.split(`,`).filter(Boolean)
        : [];

    const search: string = searchParams.get(`${prefix}-search`) ?? ``;

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
        page,
        limit,
        pageStart,
        pageEnd,
        search,
        selectedIds,
        onChangePagination,
        onChangeCeckbox,
        onChangeCeckboxAll,
        isCheckedAll,
        isIndeterminate,
    }
}