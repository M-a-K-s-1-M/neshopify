import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BlockTemplatesService } from '../services/block-templates.service';
import { CreateBlockTemplateDto } from '../dto/create-block-template.dto';
import { UpdateBlockTemplateDto } from '../dto/update-block-template.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
    BlockTemplateResponseDto,
    RemovedResponseDto,
    SchemaEntryDto,
} from 'src/common/swagger/api-models';

/**
 * Контроллер административных шаблонов блоков, используемых на страницах.
 */
@Controller('block-templates')
@ApiTags('Block Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BlockTemplatesController {
    constructor(private readonly blockTemplatesService: BlockTemplatesService) { }

    /** Возвращает перечень существующих шаблонов блоков. */
    @Get()
    @ApiOkResponse({ type: BlockTemplateResponseDto, isArray: true })
    list() {
        return this.blockTemplatesService.list();
    }

    /** Выдает список зарегистрированных схем данных. */
    @Get('schemas')
    @ApiOkResponse({ type: SchemaEntryDto, isArray: true })
    listSchemas() {
        return this.blockTemplatesService.listRegisteredSchemas();
    }

    /** Возвращает конкретный шаблон по идентификатору. */
    @Get(':id')
    @ApiOkResponse({ type: BlockTemplateResponseDto })
    get(@Param('id') id: string) {
        return this.blockTemplatesService.get(id);
    }

    /** Создает шаблон блока (только администратор). */
    @Post()
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiCreatedResponse({ type: BlockTemplateResponseDto })
    create(@Body() dto: CreateBlockTemplateDto) {
        return this.blockTemplatesService.create(dto);
    }

    /** Обновляет существующий шаблон. */
    @Patch(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: BlockTemplateResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdateBlockTemplateDto) {
        return this.blockTemplatesService.update(id, dto);
    }

    /** Удаляет шаблон. */
    @Delete(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('id') id: string) {
        return this.blockTemplatesService.remove(id);
    }
}
