/* eslint-disable no-useless-catch */
import { $api } from "../config";
import type { IAuthResponse, IGetUsersResponse } from "../models";
import type { ICreateUserForm, IFiltersUsersTable, IUser, IUpdateUserForm } from "@/entities";

export class UsersService {
    static async getAll(params: IFiltersUsersTable): Promise<IGetUsersResponse> {
        try {
            const res = await $api.get('/users', { params });
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ICreateUserForm): Promise<IAuthResponse> {
        try {
            const res = await $api.post(`/users`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async update(userId: string, data: IUpdateUserForm) {
        try {
            const res = await $api.patch(`/users`, { id: userId, ...data });
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId: string) {
        try {
            const res = await $api.delete(`/users/${userId}`)
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async getById(userId: string): Promise<IUser> {
        try {
            const res = await $api.get(`/users/${userId}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async ban(userId: string) {
        try {
            const res = await $api.patch(`/users/ban/${userId}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    static async unban(userId: string) {
        try {
            const res = await $api.patch(`/users/unban/${userId}`);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
}
