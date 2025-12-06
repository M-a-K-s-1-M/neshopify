import { registerAs } from '@nestjs/config';

export const JWT_CONFIG_KEY = 'jwt';

export default registerAs(JWT_CONFIG_KEY, () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
}));
