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

@Controller('comment-templates')
@ApiTags('Comment Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CommentTemplatesController {
    constructor(private readonly commentTemplatesService: CommentTemplatesService) { }

    @Get()
    @ApiOkResponse({ type: CommentTemplateResponseDto, isArray: true })
    list() {
        return this.commentTemplatesService.list();
    }

    @Get(':id')
    @ApiOkResponse({ type: CommentTemplateResponseDto })
    get(@Param('id') id: string) {
        return this.commentTemplatesService.get(id);
    }

    @Post()
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiCreatedResponse({ type: CommentTemplateResponseDto })
    create(@Body() dto: CreateCommentTemplateDto) {
        return this.commentTemplatesService.create(dto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: CommentTemplateResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdateCommentTemplateDto) {
        return this.commentTemplatesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    remove(@Param('id') id: string) {
        return this.commentTemplatesService.remove(id);
    }
}
