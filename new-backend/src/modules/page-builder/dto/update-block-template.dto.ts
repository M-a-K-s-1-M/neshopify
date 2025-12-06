import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockTemplateDto } from './create-block-template.dto';

export class UpdateBlockTemplateDto extends PartialType(CreateBlockTemplateDto) { }
