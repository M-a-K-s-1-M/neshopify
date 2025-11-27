import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  async getAll() {
    return await this.rolesService.getAll();
  }

  @Post()
  async create(@Body() body: { value: string; description: string }) {
    const isRole = await this.rolesService.getByValue(body.value);
    if (isRole) throw new HttpException('Такая роль уже существует', HttpStatus.CONFLICT);
    return await this.rolesService.create(body.value, body.description);
  }

  @Delete()
  async delete(@Body() data: { value: string }) {
    return await this.rolesService.deleteByValue(data.value);
  }

  @Get(':value')
  async getByValue(@Param('value') value: string) {
    return await this.rolesService.getByValue(value);
  }

}
