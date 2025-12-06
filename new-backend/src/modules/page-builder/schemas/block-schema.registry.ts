import { Injectable } from '@nestjs/common';

export type BlockSchema = Record<string, any>;

export interface SchemaEntry {
    key: string;
    category: string;
    schema: BlockSchema;
}

@Injectable()
export class BlockSchemaRegistry {
    private readonly schemas: Record<string, SchemaEntry> = {};

    constructor() {
        this.register({
            key: 'hero-simple',
            category: 'HERO',
            schema: {
                type: 'object',
                required: ['heading', 'subheading', 'cta'],
                properties: {
                    heading: { type: 'string', maxLength: 120 },
                    subheading: { type: 'string', maxLength: 240 },
                    image: { type: ['string', 'null'] },
                    cta: {
                        type: 'object',
                        properties: {
                            label: { type: 'string' },
                            href: { type: 'string' },
                        },
                    },
                },
            },
        });

        this.register({
            key: 'products-grid',
            category: 'PRODUCT',
            schema: {
                type: 'object',
                required: ['title', 'productIds'],
                properties: {
                    title: { type: 'string' },
                    productIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                    },
                    layout: {
                        type: 'object',
                        properties: {
                            columns: { type: 'number', minimum: 1, maximum: 4 },
                        },
                    },
                },
            },
        });

        this.register({
            key: 'reviews-carousel',
            category: 'REVIEWS',
            schema: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    autoPlay: { type: 'boolean' },
                },
            },
        });
    }

    private register(entry: SchemaEntry) {
        this.schemas[entry.key] = entry;
    }

    list(): SchemaEntry[] {
        return Object.values(this.schemas);
    }

    get(key: string): SchemaEntry | undefined {
        return this.schemas[key];
    }
}
