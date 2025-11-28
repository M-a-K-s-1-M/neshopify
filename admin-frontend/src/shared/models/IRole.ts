
interface IUserInRole {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    updatedAt: string;
}

export interface IRole {
    id: string;
    value: string;
    description: string;
    users: IUserInRole[];
}