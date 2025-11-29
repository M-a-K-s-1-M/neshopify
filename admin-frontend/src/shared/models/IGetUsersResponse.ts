import type { IUser } from "@/entities";

export interface IGetUsersResponse {
    users: IUser[];
    page: number;
    limit: number;
    total: number;
    pages: number;
}