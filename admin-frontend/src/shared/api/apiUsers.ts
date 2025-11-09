import type { IUserFilters } from "@/entities/user";
import axios from "axios";
import { env } from "../config/env";
import type { IUserRow } from "../mocks/users";

export const getUsers = async (filters?: IUserFilters): Promise<IUserRow[]> => {
    // const params = new URLSearchParams();
    // Всегда добавляем пагинацию по умолчанию (правильное поведение запроса к API)

    // params.append('page', filters?.page?.toString() || '1');
    // params.append('limit', filters?.limit?.toString() || '11');

    // if (filters?.limit) {
    //     params.append('limit', filters.limit.toString());
    // }
    // if (filters?.page) {
    //     params.append('page', filters.page.toString());
    // }

    // const res = await axios.get(`${env.apiUrl('/users')}?_${params.toString()}`);
    // return res.data.data;


    if (!filters?.page && !filters?.limit) {
        const res = await axios.get(`${env.apiUrl('/users')}`);
        return res.data;
    }

    const res = await axios.get(`${env.apiUrl('/users')}?_page=${filters?.page && filters.page}&_limit=${filters?.limit && filters.limit}`);
    return res.data;
}

