import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>[]> {
        return await this.prisma.user.findMany({ include: { roles: true } });
    }

}
