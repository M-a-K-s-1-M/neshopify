import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentTemplateDto } from './create-comment-template.dto';

export class UpdateCommentTemplateDto extends PartialType(CreateCommentTemplateDto) { }
