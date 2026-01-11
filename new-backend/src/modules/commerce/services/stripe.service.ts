import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { STRIPE_CONFIG_KEY } from '../../../config/stripe.config';

type StripeConfig = {
    secretKey: string;
    webhookSecret: string;
};

@Injectable()
export class StripeService {
    private stripeClient: Stripe | null = null;

    constructor(private readonly configService: ConfigService) { }

    private getConfig(): StripeConfig {
        return this.configService.get<StripeConfig>(STRIPE_CONFIG_KEY) ?? { secretKey: '', webhookSecret: '' };
    }

    get stripe(): Stripe {
        const { secretKey } = this.getConfig();
        if (!secretKey) {
            throw new ServiceUnavailableException('Stripe не настроен: отсутствует STRIPE_SECRET_KEY');
        }

        if (!this.stripeClient) {
            this.stripeClient = new Stripe(secretKey);
        }

        return this.stripeClient;
    }

    get webhookSecret(): string {
        return this.getConfig().webhookSecret;
    }

    constructEvent(rawBody: Buffer, signatureHeader: string | string[] | undefined): Stripe.Event {
        const secret = this.webhookSecret;
        if (!secret) {
            throw new ServiceUnavailableException('Stripe webhook не настроен: отсутствует STRIPE_WEBHOOK_SECRET');
        }

        const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
        if (!signature) {
            throw new BadRequestException('Отсутствует заголовок stripe-signature');
        }

        return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    }
}
