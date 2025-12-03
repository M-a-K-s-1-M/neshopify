export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    siteId?: string;
    iat?: number;
    exp?: number;
}