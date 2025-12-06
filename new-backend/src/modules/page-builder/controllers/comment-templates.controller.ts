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
import { CommentTemplatesService } from '../services/comment-templates.service';
import { CreateCommentTemplateDto } from '../dto/create-comment-template.dto';
import { UpdateCommentTemplateDto } from '../dto/update-comment-template.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommentTemplateResponseDto, RemovedResponseDto } from 'src/common/swagger/api-models';

/**
 * Контролирует административные шаблоны комментариев для быстрой вставки.
 */
@Controller('comment-templates')
@ApiTags('Comment Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CommentTemplatesController {
    constructor(private readonly commentTemplatesService: CommentTemplatesService) { }

    /** Список всех шаблонов. */
    @Get()
    @ApiOkResponse({ type: CommentTemplateResponseDto, isArray: true })
    list() {
        return this.commentTemplatesService.list();
    }

    /** Возвращает один шаблон. */
    @Get(':id')
    @ApiOkResponse({ type: CommentTemplateResponseDto })
    get(@Param('id') id: string) {
        return this.commentTemplatesService.get(id);
    }

    /** Создает шаблон комментария (для админов). */
    @Post()
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiCreatedResponse({ type: CommentTemplateResponseDto })
    create(@Body() dto: CreateCommentTemplateDto) {
        return this.commentTemplatesService.create(dto);
    }

    /** Обновляет шаблон. */
    @Patch(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: CommentTemplateResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdateCommentTemplateDto) {
        return this.commentTemplatesService.update(id, dto);
    }

    /** Удаляет шаблон. */
    @Delete(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('id') id: string) {
        return this.commentTemplatesService.remove(id);
    }
}
