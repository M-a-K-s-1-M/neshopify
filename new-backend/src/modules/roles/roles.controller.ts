import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RoleResponseDto } from 'src/common/swagger/api-models';

/**
 * Контроллер управления ролями (создание, удаление, просмотр).
 */
@Controller('roles')
@ApiTags('Roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  /** Возвращает список ролей. */
  @Get()
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  async getAll() {
    return await this.rolesService.getAll();
  }

  /** Создает роль с указанным значением и описанием. */
  @Post()
  @ApiCreatedResponse({ type: RoleResponseDto })
  async create(@Body() body: { value: string; description: string }) {
    const isRole = await this.rolesService.getByValue(body.value);
    if (isRole) throw new HttpException('Такая роль уже существует', HttpStatus.CONFLICT);
    return await this.rolesService.create(body.value, body.description);
  }

  /** Удаляет роль по значению. */
  @Delete()
  @ApiOkResponse({ type: RoleResponseDto })
  async delete(@Body() data: { value: string }) {
    return await this.rolesService.deleteByValue(data.value);
  }

  /** Возвращает роль по value. */
  @Get(':value')
  @ApiOkResponse({ type: RoleResponseDto })
  async getByValue(@Param('value') value: string) {
    return await this.rolesService.getByValue(value);
  }

}
