import type { IUser } from "@/entities/user";
import type { IRole } from "./IRole";

export interface IUserRoles {
    userId: string;
    roleId: string;
    role?: IRole;
    user?: IUser;
}