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
            name: "Hero с CTA",
            description: "Большой заголовок со статистикой",
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
    ],
    "products-featured": [
        {
            id: "featured-grid",
            name: "Популярные товары",
            description: "Сетка до 4 карточек",
            data: {
                title: "Популярные товары",
                subtitle: "Добавьте до четырёх товаров, чтобы показать лучшие позиции",
                maxItems: 4,
                layout: { columns: 4, variant: "cards" },
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
                title: "Все товары",
                description: "Каталог автоматически подхватывает созданные товары",
                pageSize: 12,
                layout: { columns: 3 },
                emptyState: {
                    title: "Пока нет товаров",
                    description: "Добавьте товары в админке",
                    actionLabel: "Добавить товар",
                },
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
};

export function getPresetsByTemplate(templateKey: string) {
    return BLOCK_TEMPLATE_PRESETS[templateKey] ?? [];
}
