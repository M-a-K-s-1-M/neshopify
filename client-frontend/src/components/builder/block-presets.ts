export interface BlockPreset {
    id: string;
    name: string;
    description?: string;
    data: Record<string, unknown>;
}

export const BLOCK_TEMPLATE_PRESETS: Record<string, BlockPreset[]> = {
    "header-nav-basic": [
        {
            id: "classic-nav",
            name: "Классический хедер",
            description: "Логотип, ссылки и кнопка действия",
            data: {
                logo: "Cosmiq",
                sticky: true,
                links: [
                    { label: "Главная", href: "/" },
                    { label: "Каталог", href: "/catalog" },
                    { label: "Профиль", href: "/profile" },
                    { label: "Корзина", href: "/cart" },
                ],
                actions: [{ label: "Войти", href: "/auth" }],
            },
        },
    ],
    "hero-brand-highlight": [
        {
            id: "launch-hero",
            name: "Hero",
            description: "Большой заголовок со статистикой",
            data: {
                heading: "Создайте интернет-магазин за минуту",
                subheading:
                    "Выберите готовые блоки, добавьте товары и начните продавать без разработчиков.",
                stats: [
                    { label: "Шаблонов", value: "20+" },
                    { label: "Каталог", value: "1 мин" },
                ],
            },
        },
    ],
    "banners": [
        {
            id: "banner-01",
            name: "Баннер (центр)",
            description: "Badge + заголовок + описание + кнопка",
            data: {
                variant: "banner-01",
                badge: "Новинка",
                title: "Сезонные товары уже в каталоге",
                description: "Подберите лучшие позиции и оформите заказ за пару кликов.",
            },
        },
        {
            id: "banner-02",
            name: "Баннер (слева + CTA справа)",
            description: "Удобен для акций и подборок",
            data: {
                variant: "banner-02",
                badge: "Акция",
                title: "Скидки на популярные товары",
                description: "Собрали подборку бестселлеров — успейте заказать по выгодной цене.",
            },
        },
        {
            id: "banner-03",
            name: "Баннер (компактный)",
            description: "Лёгкий баннер для вставки между блоками",
            data: {
                variant: "banner-03",
                badge: "Подборка",
                title: "Загляните в каталог",
                description: "Найдите товары по категориям и фильтрам.",
            },
        },
    ],
    "products-featured": [
        {
            id: "featured-grid",
            name: "Популярные товары",
            description: "Сетка до 4 карточек",
            data: {
                title: "Популярные товары",
                subtitle: "Добавьте до четырёх товаров, чтобы показать лучшие позиции",
                background: "default",
                productIds: [],
            },
        },
    ],
    "catalog-search-filter": [
        {
            id: "filters-default",
            name: "Поиск и фильтры",
            data: {
                placeholder: "Поиск товаров",
                allowCategoryFilter: true,
                allowPriceFilter: true,
                featuredCategories: [],
                priceRange: { min: 0, max: 50000 },
            },
        },
    ],
    "catalog-product-grid": [
        {
            id: "grid-default",
            name: "Каталог",
            data: {
                productIds: [],
            },
        },
    ],
    "footer-contacts-basic": [
        {
            id: "footer-info",
            name: "Футер с контактами",
            data: {
                brand: "Cosmiq",
                description: "Создайте интернет-магазин за минуту",
                links: [
                    { label: "Главная", href: "/" },
                    { label: "Каталог", href: "/catalog" },
                    { label: "Профиль", href: "/profile" },
                    { label: "Корзина", href: "/cart" },
                ],
                contacts: [
                    { type: "email", value: "hello@cosmiq.store" },
                    { type: "telegram", value: "@cosmiq_support" },
                ],
                legal: "© 2025 Cosmiq",
            },
        },
    ],
    "profile-account-form": [
        {
            id: "profile-default",
            name: "Основные данные",
            data: {
                title: "Данные аккаунта",
                description: "Обновите email и пароль, чтобы защитить аккаунт",
                fields: [
                    { label: "Электронная почта", type: "email", placeholder: "you@example.com" },
                    { label: "Пароль", type: "password", placeholder: "••••••••" },
                ],
                actions: [
                    { label: "Сохранить", variant: "default" },
                    { label: "Сменить пароль", variant: "outline" },
                ],
            },
        },
    ],
    "profile-favorites-showcase": [
        {
            id: "favorites-default",
            name: "Избранные товары",
            data: {
                title: "Избранное",
                subtitle: "Вы отметили эти товары, чтобы вернуться позже",
                items: [
                    { name: "Cosmiq Air Max", price: 5990, currency: "RUB", status: "В наличии" },
                    { name: "Flex Lamp", price: 3490, currency: "RUB", status: "Ожидается" },
                ],
            },
        },
    ],
    "cart-items-list": [
        {
            id: "cart-default",
            name: "Корзина",
            data: {
                title: "Товары в корзине",
                note: "Проверьте состав заказа перед оплатой",
                items: [
                    { name: "Cosmiq Air Max", sku: "AIR-001", quantity: 1, price: 5990, currency: "RUB" },
                    { name: "Набор аксессуаров", sku: "ACC-200", quantity: 2, price: 990, currency: "RUB" },
                ],
                summary: {
                    total: 7970,
                    currency: "RUB",
                    description: "Предварительная сумма",
                },
                actions: [
                    { label: "Оформить заказ", variant: "default" },
                    { label: "Продолжить покупки", variant: "outline" },
                ],
            },
        },
    ],
};

export function getPresetsByTemplate(templateKey: string) {
    return BLOCK_TEMPLATE_PRESETS[templateKey] ?? [];
}
