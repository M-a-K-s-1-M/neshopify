import { Injectable, Logger } from "@nestjs/common";
import { Prisma, BlockTemplate } from "../../../../generated/prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BlockSchemaRegistry } from "../schemas/block-schema.registry";
import { DEFAULT_BLOCK_TEMPLATES } from "../constants/default-block-templates";
import {
    DEFAULT_SITE_LAYOUT_BLOCKS,
    DEFAULT_SITE_PAGES,
    INTERNAL_LAYOUT_PAGE_SLUG,
} from "../constants/default-site-structure";

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

/**
 * Сервис инициализации структуры сайта: базовые шаблоны и предустановленные страницы.
 */
@Injectable()
export class SiteStructureService {
    private readonly logger = new Logger(SiteStructureService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly registry: BlockSchemaRegistry,
    ) { }

    /** Создает глобальные шаблоны и стартовые страницы для нового сайта. */
    async provisionDefaultStructure(siteId: string, client?: PrismaClientLike) {
        const prisma = client ?? this.prisma;
        await this.ensureDefaultTemplates(prisma);
        await this.ensureDefaultPages(prisma, siteId);
    }

    private async ensureDefaultTemplates(prisma: PrismaClientLike) {
        await Promise.all(
            DEFAULT_BLOCK_TEMPLATES.map(async (template) => {
                const schema = template.schema ?? this.registry.get(template.key)?.schema;

                if (!schema) {
                    this.logger.warn(`Схема для шаблона ${template.key} не найдена и будет пропущена`);
                    return;
                }

                await prisma.blockTemplate.upsert({
                    where: { key: template.key },
                    update: {
                        title: template.title,
                        description: template.description,
                        category: template.category,
                        schema,
                        previewUrl: template.previewUrl,
                    },
                    create: {
                        key: template.key,
                        title: template.title,
                        description: template.description,
                        category: template.category,
                        schema,
                        previewUrl: template.previewUrl,
                    },
                });
            }),
        );
    }

    private async ensureDefaultPages(prisma: PrismaClientLike, siteId: string) {
        const existingPages = await prisma.page.count({ where: { siteId } });
        if (existingPages > 0) {
            return;
        }

        const neededTemplateKeys = Array.from(
            new Set(
                [
                    ...DEFAULT_SITE_LAYOUT_BLOCKS.map((block) => block.templateKey),
                    ...DEFAULT_SITE_PAGES.flatMap((page) => page.blocks.map((block) => block.templateKey)),
                ],
            ),
        );

        const templates = await prisma.blockTemplate.findMany({
            where: { key: { in: neededTemplateKeys } },
        });
        const templateMap = new Map<string, BlockTemplate>(templates.map((tpl) => [tpl.key, tpl]));

        const layoutPage = await prisma.page.create({
            data: {
                siteId,
                title: "Layout",
                slug: INTERNAL_LAYOUT_PAGE_SLUG,
                type: "CUSTOM",
                isVisible: false,
            },
        });

        let layoutOrder = 1;
        for (const block of DEFAULT_SITE_LAYOUT_BLOCKS) {
            const template = templateMap.get(block.templateKey);
            if (!template) {
                this.logger.warn(`Шаблон ${block.templateKey} отсутствует и блок пропущен`);
                continue;
            }

            await prisma.blockInstance.create({
                data: {
                    pageId: layoutPage.id,
                    templateId: template.id,
                    order: layoutOrder++,
                    data: block.data,
                    pinned: block.pinned ?? false,
                },
            });
        }

        for (const blueprint of DEFAULT_SITE_PAGES) {
            const page = await prisma.page.create({
                data: {
                    siteId,
                    title: blueprint.title,
                    slug: blueprint.slug,
                    type: blueprint.type,
                    isVisible: blueprint.isVisible,
                    seo: blueprint.seo,
                },
            });

            let order = 1;
            for (const block of blueprint.blocks) {
                const template = templateMap.get(block.templateKey);
                if (!template) {
                    this.logger.warn(`Шаблон ${block.templateKey} отсутствует и блок пропущен`);
                    continue;
                }

                await prisma.blockInstance.create({
                    data: {
                        pageId: page.id,
                        templateId: template.id,
                        order: order++,
                        data: block.data,
                        pinned: block.pinned ?? false,
                    },
                });
            }
        }
    }
}
