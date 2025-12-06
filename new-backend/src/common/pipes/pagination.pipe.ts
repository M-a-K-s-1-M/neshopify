import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export interface PaginationQuery {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginationPipeOptions {
    defaultPage?: number;
    defaultLimit?: number;
    maxLimit?: number;
}

/**
 * Normalizes pagination query parameters and prevents unbounded requests.
 */
@Injectable()
export class PaginationPipe implements PipeTransform<Record<string, any>, PaginationQuery> {
    constructor(private readonly options: PaginationPipeOptions = {}) { }

    transform(value: Record<string, any>): PaginationQuery {
        const defaultPage = this.options.defaultPage ?? 1;
        const defaultLimit = this.options.defaultLimit ?? 20;
        const maxLimit = this.options.maxLimit ?? 100;

        const page = this.toPositiveInteger(value?.page, defaultPage, 'page');
        const limit = Math.min(
            this.toPositiveInteger(value?.limit, defaultLimit, 'limit'),
            maxLimit,
        );

        const search = typeof value?.search === 'string' ? value.search.trim() : undefined;

        return { page, limit, search };
    }

    private toPositiveInteger(value: unknown, fallback: number, field: string): number {
        if (value === undefined || value === null || value === '') {
            return fallback;
        }

        const coerced = Number(value);

        if (!Number.isInteger(coerced) || coerced <= 0) {
            throw new BadRequestException(`${field} must be a positive integer`);
        }

        return coerced;
    }
}
