import type { IUserRoles } from "@/shared/models/IUserRoles";

export interface IUser {
    id: string;
    email: string;
    banned: boolean;
    userRoles: IUserRoles[];
    createdAt: string;
    updatedAt: string;
}