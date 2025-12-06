import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMetaDto } from './api-models';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) =>
    applyDecorators(
        ApiExtraModels(PaginationMetaDto, model),
        ApiOkResponse({
            schema: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { $ref: getSchemaPath(model) } },
                    meta: { $ref: getSchemaPath(PaginationMetaDto) },
                },
            },
        }),
    );
