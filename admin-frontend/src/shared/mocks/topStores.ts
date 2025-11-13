export interface ITopStore {
    id: string;
    name: string;
    revenue: number;
    revenueFormatted: string;
    changePercent: number;
    avatar?: string;
}

export const topStoresMock: ITopStore[] = [
    {
        id: 'store_1',
        name: 'Магазин Электроники',
        revenue: 150000,
        revenueFormatted: '150,000 ₽',
        changePercent: 12.5,
    },
    {
        id: 'store_2',
        name: 'Одежда и Аксессуары',
        revenue: 120000,
        revenueFormatted: '120,000 ₽',
        changePercent: 8.3,
    },
    {
        id: 'store_3',
        name: 'Книжный Мир',
        revenue: 95000,
        revenueFormatted: '95,000 ₽',
        changePercent: -2.1,
    },
    {
        id: 'store_4',
        name: 'Спорттовары',
        revenue: 85000,
        revenueFormatted: '85,000 ₽',
        changePercent: 15.7,
    },
    {
        id: 'store_5',
        name: 'Дом и Сад',
        revenue: 78000,
        revenueFormatted: '78,000 ₽',
        changePercent: 5.4,
    },
];

export default topStoresMock;