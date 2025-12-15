import { BlockCategory } from "../../../../generated/prisma/client";

export interface DefaultBlockTemplate {
    key: string;
    title: string;
    description?: string;
    category: BlockCategory;
    schema?: Record<string, any>;
    previewUrl?: string;
}

export const DEFAULT_BLOCK_TEMPLATES: DefaultBlockTemplate[] = [
    {
        key: "header-nav-basic",
        title: "Хедер с навигацией",
        description: "Фиксированное меню с логотипом и четырьмя ссылками",
        category: BlockCategory.NAVIGATION,
        schema: {
            type: "object",
            required: ["logo", "links"],
            properties: {
                logo: { type: "string", maxLength: 60 },
                sticky: { type: "boolean", default: true },
                links: {
                    type: "array",
                    minItems: 1,
                    maxItems: 6,
                    items: {
                        type: "object",
                        required: ["label", "href"],
                        properties: {
                            label: { type: "string", maxLength: 40 },
                            href: { type: "string" },
                            active: { type: "boolean" },
                        },
                    },
                },
                actions: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label", "href"],
                        properties: {
                            label: { type: "string", maxLength: 32 },
                            href: { type: "string" },
                        },
                    },
                },
            },
        },
    },
    {
        key: "hero-brand-highlight",
        title: "Hero с описанием бренда",
        description: "Большой заголовок с подзаголовком, CTA и иллюстрацией",
        category: BlockCategory.HERO,
        schema: {
            type: "object",
            required: ["heading", "subheading"],
            properties: {
                heading: { type: "string", maxLength: 120 },
                subheading: { type: "string", maxLength: 260 },
                mediaUrl: { type: ["string", "null"] },
                stats: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label", "value"],
                        properties: {
                            label: { type: "string" },
                            value: { type: "string" },
                        },
                    },
                },
                ctaPrimary: {
                    type: "object",
                    required: ["label", "href"],
                    properties: {
                        label: { type: "string" },
                        href: { type: "string" },
                    },
                },
                ctaSecondary: {
                    type: ["object", "null"],
                    properties: {
                        label: { type: "string" },
                        href: { type: "string" },
                    },
                },
            },
        },
    },
    {
        key: "products-featured",
        title: "Популярные товары",
        description: "Сетка до 4 избранных товаров",
        category: BlockCategory.PRODUCT,
        schema: {
            type: "object",
            required: ["title"],
            properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                maxItems: { type: "number", minimum: 1, maximum: 4, default: 4 },
                layout: {
                    type: "object",
                    properties: {
                        columns: { type: "number", minimum: 1, maximum: 4 },
                        variant: { type: "string" },
                    },
                },
                productIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    maxItems: 4,
                },
            },
        },
    },
    {
        key: "catalog-search-filter",
        title: "Поиск и фильтры каталога",
        description: "Строка поиска и быстрые фильтры по цене и категориям",
        category: BlockCategory.CONTENT,
        schema: {
            type: "object",
            properties: {
                placeholder: { type: "string" },
                allowCategoryFilter: { type: "boolean", default: true },
                allowPriceFilter: { type: "boolean", default: true },
                featuredCategories: {
                    type: "array",
                    items: { type: "string" },
                },
                priceRange: {
                    type: "object",
                    properties: {
                        min: { type: "number", minimum: 0 },
                        max: { type: "number" },
                    },
                },
            },
        },
    },
    {
        key: "catalog-product-grid",
        title: "Каталог товаров",
        description: "Сетка товаров с пагинацией",
        category: BlockCategory.PRODUCT,
        schema: {
            type: "object",
            properties: {
                productIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                },
            },
        },
    },
    {
        key: "footer-contacts-basic",
        title: "Футер с контактами",
        description: "Название бренда, быстрые ссылки и контакты",
        category: BlockCategory.CONTENT,
        schema: {
            type: "object",
            required: ["brand", "links"],
            properties: {
                brand: { type: "string" },
                description: { type: "string" },
                links: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label", "href"],
                        properties: {
                            label: { type: "string" },
                            href: { type: "string" },
                        },
                    },
                },
                contacts: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["type", "value"],
                        properties: {
                            type: { type: "string" },
                            value: { type: "string" },
                        },
                    },
                },
                legal: { type: "string" },
            },
        },
    },
    {
        key: "profile-account-form",
        title: "Форма профиля",
        description: "Поля для обновления email и пароля",
        category: BlockCategory.CONTENT,
        schema: {
            type: "object",
            required: ["title"],
            properties: {
                title: { type: "string" },
                description: { type: "string" },
                fields: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label", "type"],
                        properties: {
                            label: { type: "string" },
                            type: { type: "string", enum: ["text", "email", "password"] },
                            placeholder: { type: "string" },
                        },
                    },
                },
                actions: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label"],
                        properties: {
                            label: { type: "string" },
                            variant: { type: "string" },
                        },
                    },
                },
            },
        },
    },
    {
        key: "profile-favorites-showcase",
        title: "Избранные товары",
        description: "Список сохранённых позиций пользователя",
        category: BlockCategory.PRODUCT,
        schema: {
            type: "object",
            required: ["title"],
            properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name"],
                        properties: {
                            name: { type: "string" },
                            price: { type: "number" },
                            currency: { type: "string" },
                            status: { type: "string" },
                        },
                    },
                },
            },
        },
    },
    {
        key: "cart-items-list",
        title: "Корзина с товарами",
        description: "Позиции заказа и итоговая сумма",
        category: BlockCategory.PRODUCT,
        schema: {
            type: "object",
            required: ["title", "items"],
            properties: {
                title: { type: "string" },
                note: { type: "string" },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "quantity"],
                        properties: {
                            name: { type: "string" },
                            sku: { type: "string" },
                            quantity: { type: "number", minimum: 1 },
                            price: { type: "number" },
                            currency: { type: "string" },
                        },
                    },
                },
                summary: {
                    type: "object",
                    properties: {
                        total: { type: "number" },
                        currency: { type: "string" },
                        description: { type: "string" },
                    },
                },
                actions: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["label"],
                        properties: {
                            label: { type: "string" },
                            variant: { type: "string" },
                        },
                    },
                },
            },
        },
    },
];
