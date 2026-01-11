import { registerAs } from '@nestjs/config';

export const STRIPE_CONFIG_KEY = 'stripe';

export default registerAs(STRIPE_CONFIG_KEY, () => {
    return {
        secretKey: process.env.STRIPE_SECRET_KEY ?? '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    } as const;
});
