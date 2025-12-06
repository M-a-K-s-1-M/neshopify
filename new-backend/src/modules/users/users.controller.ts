import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltersUsersDto } from './dto/filters-users.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { PaginationPipe } from '../../common/pipes';
import type { PaginationQuery } from '../../common/pipes';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto, UsersListResponseDto } from 'src/common/swagger/api-models';

@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOkResponse({ type: UsersListResponseDto })
  async getAll(
    @Query(new PaginationPipe({ defaultLimit: 20, maxLimit: 100 })) pagination: PaginationQuery, // Унифицируем page/limit через общий пайп
    @Query() query: FiltersUsersDto,
  ) {
    return await this.usersService.getAll(query, pagination);
  }

  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() dto: CreateUserDto) {
    const candidate = await this.usersService.getByEmail(dto.email);
    if (candidate) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.create(dto);
    return user;
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getById(id);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch()
  @ApiOkResponse({ type: UserResponseDto })
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
  @ApiOkResponse({ type: UserResponseDto })
  async ban(@Param('id') id: string) {
    const candidate = await this.usersService.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.ban(id);
  }

  @Patch('unban/:id')
  @ApiOkResponse({ type: UserResponseDto })
  async unban(@Param('id') id: string) {
    const candidate = await this.usersService.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.unban(id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserResponseDto })
  async deleteById(@Param('id') id: string) {
    const candidate = await this.getById(id);
    if (!candidate) throw new HttpException('Такого пользователя не существует', HttpStatus.NOT_FOUND);

    return await this.usersService.deleteById(id);
  }

}
