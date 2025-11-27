import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

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

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}