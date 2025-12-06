import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReceivedResponseDto } from 'src/common/swagger/api-models';

/**
 * Принимает входящие вебхуки от платежных провайдеров и
 * передает их в бизнес-логику платежей.
 */
@Controller('payments/webhooks')
@ApiTags('Payments')
export class PaymentsWebhookController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /** Обрабатывает вебхук конкретного провайдера. */
    @Post(':provider')
    @ApiOkResponse({ type: ReceivedResponseDto })
    handle(@Param('provider') provider: string, @Body() dto: PaymentWebhookDto) {
        return this.paymentsService.handleWebhook(provider, dto);
    }
}
