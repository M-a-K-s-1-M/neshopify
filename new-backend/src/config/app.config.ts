import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';

export default registerAs(APP_CONFIG_KEY, () => {
    const port = Number(process.env.PORT ?? 5000);

    return {
        name: 'neshopify-api',
        env: process.env.NODE_ENV ?? 'development',
        port: Number.isFinite(port) ? port : 5000,
        clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
    } as const;
});
