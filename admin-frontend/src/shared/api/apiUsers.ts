/* eslint-disable no-useless-catch */
import axios from "axios";
import { env } from "../config/env";
import type { IUserRow } from "../mocks/users";
import { $api } from "../config";

interface IUserFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export const getUsers = async (filters?: IUserFilters): Promise<IUserRow[]> => {

    const res = await axios.get(`${env.apiUrl('/users')}?${filters?.page ? `_page=${filters.page}&` : ''}${filters?.limit ? `_limit=${filters.limit}&` : ''}${filters?.search ? `_name=${filters.search}&_email=${filters.search}` : ''}`);
    return res.data;
}

export default class UsersService {
    static async create(data: { email: string; password: string; roles: string[] }) {
        try {
            const res = await $api.post(`/users`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
}
