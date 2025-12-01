/* eslint-disable no-useless-catch */
import type { AxiosResponse } from "axios";
import { $api } from "../config";
import type { IRole } from "../models";

export class RolesService {
    static async getAll(): Promise<AxiosResponse<IRole[]>> {
        try {
            const res = await $api.get('/roles');
            return res.data;
        } catch (error) {
            throw error;
        }
    }
}