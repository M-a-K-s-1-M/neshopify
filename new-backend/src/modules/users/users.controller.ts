import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAll() {
    return await this.usersService.getAll();
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

  @Patch()
  async update(@Body('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(id, dto);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    const candidate = await this.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.deleteById(id);
  }

}
