export interface IDashboardCard {
    id: string;
    title: string;
    value: string; // display-ready value (formatted)
    changePercent: number; // numeric percent, positive or negative
    changeLabel?: string; // human readable change, e.g. '+5.2% за месяц'
    description?: string; // small subtitle
    trend?: 'up' | 'down' | 'neutral';
    icon?: string; // optional icon name/key
}

export const dashboardCards: IDashboardCard[] = [
    {
        id: 'users',
        title: 'Всего пользователей',
        value: '9,355',
        changePercent: 5.2,
        changeLabel: '+5.2% за месяц',
        description: 'за месяц',
        trend: 'up',
        icon: 'users'
    },
    {
        id: 'sites',
        title: 'Активных сайтов',
        value: '4,524',
        changePercent: 12.1,
        changeLabel: '+12.1% за месяц',
        description: 'за месяц',
        trend: 'up',
        icon: 'sites'
    },
    {
        id: 'revenue',
        title: 'Месячный доход',
        value: '₽2,847,500',
        changePercent: 8.7,
        changeLabel: '+8.7% за месяц',
        description: 'за месяц',
        trend: 'up',
        icon: 'revenue'
    },
    {
        id: 'support',
        title: 'Обращений в поддержку',
        value: '124',
        changePercent: -3.2,
        changeLabel: '-3.2% за месяц',
        description: 'за месяц',
        trend: 'down',
        icon: 'support'
    }
];

export default dashboardCards;
