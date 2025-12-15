import type { BlockCategory, BlockInstanceDto, BlockTemplateDto, PageDto } from "@/lib/types";

interface PreviewBlock {
    templateKey: string;
    data: Record<string, unknown>;
    pinned?: boolean;
}

export const INTERNAL_LAYOUT_PAGE_SLUG = "__layout__";

const NAV_LINKS = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Профиль", href: "/profile" },
    { label: "Корзина", href: "/cart" },
];

export const DEFAULT_LAYOUT_BLOCKS: PreviewBlock[] = [
    {
        templateKey: "header-nav-basic",
        pinned: true,
        data: {
            logo: "Cosmiq",
            sticky: true,
            links: NAV_LINKS,
            actions: [{ label: "Войти", href: "/auth" }],
        },
    },
    {
        templateKey: "footer-contacts-basic",
        data: {
            brand: "Cosmiq",
            description: "Создайте интернет-магазин за минуту",
            links: NAV_LINKS,
            contacts: [
                { type: "email", value: "hello@cosmiq.store" },
                { type: "telegram", value: "@cosmiq_support" },
            ],
            legal: "© 2025 Cosmiq",
        },
    },
];

const TEMPLATE_HINTS: Record<
    string,
    { title: string; description?: string | null; category?: BlockCategory }
> = {
    "header-nav-basic": {
        title: "Хедер с навигацией",
        description: "Меню с логотипом и ссылками",
        category: "NAVIGATION",
    },
    "hero-brand-highlight": {
        title: "Hero",
        description: "Заголовок, подзаголовок и CTA",
        category: "HERO",
    },
    "products-featured": {
        title: "Популярные товары",
        description: "Сетка избранных позиций",
        category: "PRODUCT",
    },
    "catalog-search-filter": {
        title: "Поиск и фильтры",
        category: "CONTENT",
    },
    "catalog-product-grid": {
        title: "Каталог товаров",
        category: "PRODUCT",
    },
    "footer-contacts-basic": {
        title: "Футер",
        category: "CONTENT",
    },
    "profile-account-form": {
        title: "Данные аккаунта",
        category: "CONTENT",
    },
    "profile-favorites-showcase": {
        title: "Избранные товары",
        category: "PRODUCT",
    },
    "cart-items-list": {
        title: "Корзина",
        category: "PRODUCT",
    },
};

const DEFAULT_PAGE_BLOCKS: Partial<Record<PageDto["type"], PreviewBlock[]>> = {
    HOME: [
        {
            templateKey: "hero-brand-highlight",
            data: {
                heading: "Создайте интернет-магазин за минуту",
                subheading:
                    "Выберите готовые блоки, добавьте товары и начните продавать без разработчиков.",
                mediaUrl: null,
                stats: [
                    { label: "Шаблонов", value: "20+" },
                    { label: "Каталог", value: "1 мин" },
                ],
                ctaPrimary: { label: "Создать сайт", href: "/builder" },
                ctaSecondary: { label: "Посмотреть демо", href: "/preview" },
            },
        },
        {
            templateKey: "products-featured",
            data: {
                title: "Популярные товары",
                subtitle: "Добавьте до четырёх товаров, чтобы показать лучшие позиции",
                background: "default",
                productIds: [],
            },
        },
    ],
    CATALOG: [
        {
            templateKey: "catalog-search-filter",
            data: {
                placeholder: "Поиск товаров",
                allowCategoryFilter: true,
                allowPriceFilter: true,
                featuredCategories: [],
                priceRange: { min: 0, max: 50000 },
            },
        },
        {
            templateKey: "catalog-product-grid",
            data: {
                productIds: [],
            },
        },
    ],
    PROFILE: [
        {
            templateKey: "profile-account-form",
            data: {
                title: "Данные аккаунта",
                description: "Обновите email и пароль, чтобы ваш магазин был под защитой.",
                fields: [
                    { label: "Электронная почта", type: "email", placeholder: "founder@cosmiq.store" },
                    { label: "Пароль", type: "password", placeholder: "••••••••" },
                ],
                actions: [
                    { label: "Сохранить изменения", variant: "default" },
                    { label: "Сменить пароль", variant: "outline" },
                ],
            },
        },
        {
            templateKey: "profile-favorites-showcase",
            data: {
                title: "Избранные товары",
                subtitle: "Все, что вы отметили, чтобы вернуться позже",
                items: [
                    { name: "Cosmiq Air Max", price: 5990, currency: "RUB", status: "В наличии" },
                    { name: "Flex Lamp", price: 3490, currency: "RUB", status: "Ожидается" },
                ],
            },
        },
    ],
    CART: [
        {
            templateKey: "cart-items-list",
            data: {
                title: "Товары в корзине",
                note: "Укажите адрес доставки на следующем шаге",
                items: [
                    {
                        name: "Cosmiq Air Max",
                        sku: "AIR-001",
                        quantity: 1,
                        price: 5990,
                        currency: "RUB",
                    },
                    {
                        name: "Аксессуары для Air Max",
                        sku: "AIR-KIT",
                        quantity: 2,
                        price: 990,
                        currency: "RUB",
                    },
                ],
                summary: {
                    total: 7970,
                    currency: "RUB",
                    description: "Предварительная сумма заказа",
                },
                actions: [
                    { label: "Оформить заказ", variant: "default" },
                    { label: "Продолжить покупки", variant: "outline" },
                ],
            },
        },
    ],
};

export function getDefaultBlocksForPageType(type: PageDto["type"] | undefined) {
    if (!type) {
        return [];
    }
    const blueprint = DEFAULT_PAGE_BLOCKS[type];
    if (!blueprint || blueprint.length === 0) {
        return [];
    }
    return blueprint.map((block, index) => buildPreviewBlock(block, index));
}

function buildPreviewBlock(block: PreviewBlock, index: number): BlockInstanceDto {
    const hints = TEMPLATE_HINTS[block.templateKey] ?? {
        title: "Блок",
        description: null,
        category: "GENERAL" as BlockCategory,
    };

    const template: BlockTemplateDto = {
        id: `preview-template-${block.templateKey}`,
        key: block.templateKey,
        title: hints.title,
        description: hints.description ?? null,
        category: hints.category ?? "GENERAL",
        schema: {},
        previewUrl: null,
    };

    return {
        id: `preview-${block.templateKey}-${index}`,
        pageId: "preview",
        order: index + 1,
        pinned: Boolean(block.pinned),
        data: block.data,
        templateId: template.id,
        template,
    };
}
