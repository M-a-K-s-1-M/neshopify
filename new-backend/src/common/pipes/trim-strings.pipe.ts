import { Injectable, PipeTransform } from '@nestjs/common';

/**
 * Recursively trims all string properties in the payload to avoid persisting
 * accidental leading/trailing spaces.
 */
@Injectable()
export class TrimStringsPipe implements PipeTransform {
    transform(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map((item) => this.transform(item));
        }

        if (value !== null && typeof value === 'object') {
            const cloned: Record<string, unknown> = {};
            Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
                cloned[key] = this.transform(entry);
            });
            return cloned;
        }

        if (typeof value === 'string') {
            return value.trim();
        }

        return value;
    }
}
