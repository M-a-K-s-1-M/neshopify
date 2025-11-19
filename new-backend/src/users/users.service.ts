import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<User[]> {
        return await this.prisma.user.findMany();
    }

    async create(data: any): Promise<User> {
        return await this.prisma.user.create({
            data,
        });
    }

}
