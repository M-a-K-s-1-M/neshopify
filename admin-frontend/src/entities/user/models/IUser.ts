import type { IUserRoles } from "@/shared/models/IUserRoles";

export interface IUser {
    id: string;
    email: string;
    userRoles: IUserRoles[];
    createdAt: string;
    updatedAt: string;
}