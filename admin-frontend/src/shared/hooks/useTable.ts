import { useSearchParams } from 'react-router-dom';
import type { IUserRow } from '../mocks/users';
import type { IDomainRow } from '../mocks/domains';

export const useTable = (prefix: 'users' | 'domains') => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page: number = searchParams.get(`_${prefix}-table-page`) ? Number(searchParams.get(`_${prefix}-table-page`)) : 1;
    const limit: number = 5;

    const pageStart: number = (page - 1) * limit;
    const pageEnd: number = pageStart + limit;

    // const indertaminate: boolean = searchParams.get(`_${prefix}-selected-ids`) ? searchParams.get(`_${prefix}-selected-ids`)!.split(`,`).length > 0 && searchParams.get(`_${prefix}-selected-ids`)!.split(`,`).length < limit : false;

    const selectedIds: string[] = searchParams.get(`_${prefix}-selected-ids`) ? searchParams.get(`_${prefix}-selected-ids`)!.split(`,`).filter(Boolean) : [];

    const search: string = searchParams.get(`_${prefix}-search`) ?? ``;

    const onChangePagination = (e: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set(`_${prefix}-table-page`, e.toString());
            return newParams;
        })
    }

    const isCheckedAll = (data: IUserRow[] | IDomainRow[]) => {
        return searchParams.get(`_${prefix}-selected-ids`) ? searchParams.get(`_${prefix}-selected-ids`)?.split(',').length === data.length : false
    }

    const isIndeterminate = (data: IUserRow[] | IDomainRow[]) => {
        const selectedCount = searchParams.get(`_${prefix}-selected-ids`) ? searchParams.get(`_${prefix}-selected-ids`)!.split(`,`).length : 0;
        return selectedCount > 0 && selectedCount < data.length;
    }

    const onChangeCeckbox = (entitiesId: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (selectedIds.includes(entitiesId)) {
                const newSelectedIds = selectedIds.filter(id => id !== entitiesId);
                if (newSelectedIds.length > 0) {
                    newParams.set(`_${prefix}-selected-ids`, newSelectedIds.join(','));
                    return newParams;
                } else {
                    newParams.delete(`_${prefix}-selected-ids`);
                    return newParams;
                }
            } else {
                const newSelectedIds = [...selectedIds, entitiesId];
                newParams.set(`_${prefix}-selected-ids`, newSelectedIds.join(','));
                return newParams;
            }
        })
    }

    const onChangeCeckboxAll = (e: React.ChangeEvent<HTMLInputElement>, data: IUserRow[] | IDomainRow[]) => {
        if (e.target.checked) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set(`_${prefix}-selected-ids`, data.map(u => u.id).join(','));
                return newParams;
            })
        } else {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete(`_${prefix}-selected-ids`);
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