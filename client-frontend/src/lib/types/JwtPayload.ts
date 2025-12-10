export interface JwtPayloadDto {
    sub: string;
    email: string;
    roles: string[];
    siteId?: string;
    exp?: number;
    iat?: number;
}
