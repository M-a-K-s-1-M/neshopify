import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @Post()
  async create(@Body() body: { value: string; description: string }) {
    return this.rolesService.create(body.value, body.description);
  }

  @Delete()
  async delete(@Body() data: { value: string }) {
    return this.rolesService.deleteByValue(data.value);
  }

  @Get(':value')
  async getByValue(@Param('value') value: string) {
    return this.rolesService.getByValue(value);
  }

}
