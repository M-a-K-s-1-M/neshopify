import { PageType } from "../../../../generated/prisma/client";

export interface DefaultBlockBlueprint {
    templateKey: string;
    data: Record<string, any>;
    pinned?: boolean;
}

export interface DefaultPageBlueprint {
    type: PageType;
    slug: string;
    title: string;
    isVisible: boolean;
    seo?: Record<string, any>;
    blocks: DefaultBlockBlueprint[];
}

const NAV_LINKS = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
    { label: "Профиль", href: "/profile" },
    { label: "Корзина", href: "/cart" },
];

const FOOTER_BLOCK = {
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
};

export const DEFAULT_SITE_PAGES: DefaultPageBlueprint[] = [
    {
        type: PageType.HOME,
        slug: "home",
        title: "Главная",
        isVisible: true,
        blocks: [
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
                templateKey: "hero-brand-highlight",
                data: {
                    badge: "Beta",
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
                    maxItems: 4,
                    layout: { columns: 4, variant: "cards" },
                    productIds: [],
                },
            },
            FOOTER_BLOCK,
        ],
    },
    {
        type: PageType.CATALOG,
        slug: "catalog",
        title: "Каталог",
        isVisible: true,
        blocks: [
            {
                templateKey: "header-nav-basic",
                pinned: true,
                data: {
                    logo: "Cosmiq",
                    sticky: true,
                    links: NAV_LINKS,
                    actions: [{ label: "Профиль", href: "/profile" }],
                },
            },
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
                    title: "Все товары",
                    description: "Каталог автоматически подхватывает товары, которые вы создадите",
                    pageSize: 12,
                    layout: { columns: 3 },
                    emptyState: {
                        title: "Пока нет товаров",
                        description: "Добавьте товары в каталоге конструктора",
                        actionLabel: "Добавить товар",
                    },
                },
            },
            FOOTER_BLOCK,
        ],
    },
    {
        type: PageType.PROFILE,
        slug: "profile",
        title: "Профиль",
        isVisible: true,
        blocks: [
            {
                templateKey: "header-nav-basic",
                pinned: true,
                data: {
                    logo: "Cosmiq",
                    sticky: true,
                    links: NAV_LINKS,
                    actions: [{ label: "Выйти", href: "/auth/logout" }],
                },
            },
            {
                templateKey: "profile-account-form",
                data: {
                    title: "Данные аккаунта",
                    description: "Обновите email и пароль, чтобы ваш магазин всегда был под защитой.",
                    fields: [
                        {
                            label: "Электронная почта",
                            type: "email",
                            placeholder: "founder@cosmiq.store",
                        },
                        {
                            label: "Пароль",
                            type: "password",
                            placeholder: "••••••••••••",
                        },
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
            FOOTER_BLOCK,
        ],
    },
    {
        type: PageType.CART,
        slug: "cart",
        title: "Корзина",
        isVisible: true,
        blocks: [
            {
                templateKey: "header-nav-basic",
                pinned: true,
                data: {
                    logo: "Cosmiq",
                    sticky: true,
                    links: NAV_LINKS,
                    actions: [{ label: "Каталог", href: "/catalog" }],
                },
            },
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
            FOOTER_BLOCK,
        ],
    },
];
