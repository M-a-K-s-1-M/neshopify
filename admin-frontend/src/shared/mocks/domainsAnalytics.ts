export interface IDomainsMetric {
    id: 'total' | 'active' | 'expiring' | 'expired' | 'suspended';
    title: string;
    value: number;            // сырое число для логики
    valueFormatted: string;   // формат для отображения
    changeLabel?: string;     // опционально: изменение, например "+5.2% за месяц"
    icon?: string;            // опционально: ключ/название иконки
}

export const domainsAnalyticsMock: IDomainsMetric[] = [
    {
        id: 'total',
        title: 'Всего доменов',
        value: 20,
        valueFormatted: '20',
        changeLabel: '+3 за месяц',
        icon: 'globe',
    },
    {
        id: 'active',
        title: 'Активные',
        value: 8,
        valueFormatted: '8',
        changeLabel: '+1 за месяц',
        icon: 'globe-check',
    },
    {
        id: 'expiring',
        title: 'Ожидают',
        value: 4,
        valueFormatted: '4',
        changeLabel: '+1 за месяц',
        icon: 'globe-warning',
    },
    {
        id: 'expired',
        title: 'Проблемы',
        value: 4,
        valueFormatted: '4',
        changeLabel: '0 за месяц',
        icon: 'globe-x',
    },
];

export default domainsAnalyticsMock;