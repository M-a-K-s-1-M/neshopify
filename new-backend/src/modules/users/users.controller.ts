import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltersUsersDto } from './dto/filters-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAll(@Query() query: FiltersUsersDto) {
    return await this.usersService.getAll(query);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const candidate = await this.usersService.getByEmail(dto.email);
    if (candidate) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.create(dto);
    return user;
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
    const candidate = await this.usersService.getById(id);
    const isUniqueEmail = await this.usersService.getByEmail(dto.email);

    if (isUniqueEmail && isUniqueEmail.id !== id) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
    }

    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);
    return await this.usersService.update(id, dto);
  }

  @Patch('ban/:id')
  async ban(@Param('id') id: string) {
    const candidate = await this.usersService.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.ban(id);
  }

  @Patch('unban/:id')
  async unban(@Param('id') id: string) {
    const candidate = await this.usersService.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.unban(id);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    const candidate = await this.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.deleteById(id);
  }

}
