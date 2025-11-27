import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const candidate = await this.usersService.getByEmail(dto.email);
    if (candidate) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
    }

    const { accessToken, user } = await this.usersService.create(dto);
    return { accessToken, user };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
