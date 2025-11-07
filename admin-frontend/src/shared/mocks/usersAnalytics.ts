export interface IUsersMetric {
    id: 'total' | 'active' | 'newMonthly' | 'blocked';
    title: string;
    value: number;            // сырое число для логики
    valueFormatted: string;   // формат для отображения
    icon?: string;            // опционально: ключ/название иконки
}

export const usersAnalyticsMock: IUsersMetric[] = [
    {
        id: 'total',
        title: 'Всего пользователей',
        value: 9355,
        valueFormatted: '9,355',
        icon: 'users',
    },
    {
        id: 'active',
        title: 'Активных',
        value: 9355,
        valueFormatted: '9,355',
        icon: 'user-check',
    },
    {
        id: 'newMonthly',
        title: 'Новых за месяц',
        value: 1543,
        valueFormatted: '1,543',
        icon: 'user-plus',
    },
    {
        id: 'blocked',
        title: 'Заблокированных',
        value: 70,
        valueFormatted: '70',
        icon: 'user-x',
    },
];

export default usersAnalyticsMock;
