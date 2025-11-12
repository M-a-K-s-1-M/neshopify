import { env } from "../config/env";
import axios from "axios";
import type { IDomainRow } from "../mocks/domains";

interface IDomainsFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export const getDomains = async (filters?: IDomainsFilters): Promise<IDomainRow[]> => {

    const res = await axios.get(`${env.apiUrl('/domains')}?${filters?.page ? `_page=${filters.page}&` : ''}${filters?.limit ? `_limit=${filters.limit}&` : ''}${filters?.search ? `_domain=${filters.search}` : ''}`);
    return res.data;
}