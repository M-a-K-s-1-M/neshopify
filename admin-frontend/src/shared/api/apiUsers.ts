import axios from "axios";
import { env } from "../config/env";
import type { IUserRow } from "../mocks/users";

interface IUserFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export const getUsers = async (filters?: IUserFilters): Promise<IUserRow[]> => {

    const res = await axios.get(`${env.apiUrl('/users')}?${filters?.page ? `_page=${filters.page}&` : ''}${filters?.limit ? `_limit=${filters.limit}&` : ''}${filters?.search ? `_name=${filters.search}&_email=${filters.search}` : ''}`);
    return res.data;
}

