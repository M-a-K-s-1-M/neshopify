import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

/**
 * Обертка над PrismaClient с авто-сокрытием полей и управлением подключением.
 */
@Injectable()
export class PrismaService extends PrismaClient<{ omit: { user: { passwordHash: true } } }> implements OnModuleInit {

    constructor() {
        super({
            omit: {
                user: {
                    passwordHash: true,
                }
            }
        });
    }

    /** Устанавливает соединение с БД при старте модуля. */
    async onModuleInit() {
        await this.$connect();
    }

    /** Корректно закрывает соединение при остановке приложения. */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}