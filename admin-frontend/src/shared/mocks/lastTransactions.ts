export interface ILastTransaction {
    id: string;
    date: string;
    amount: number;
    amountFormatted: string;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    user: string;
}

export const lastTransactionsMock: ILastTransaction[] = [
    {
        id: 'txn_1',
        date: '2025-11-13T10:30:00.000Z',
        amount: 2500,
        amountFormatted: '2,500 ₽',
        description: 'Покупка смартфона',
        status: 'completed',
        user: 'Иван Петров',
    },
    {
        id: 'txn_2',
        date: '2025-11-13T09:15:00.000Z',
        amount: 1500,
        amountFormatted: '1,500 ₽',
        description: 'Оплата подписки',
        status: 'completed',
        user: 'Мария Сидорова',
    },
    {
        id: 'txn_3',
        date: '2025-11-12T16:45:00.000Z',
        amount: 3200,
        amountFormatted: '3,200 ₽',
        description: 'Заказ одежды',
        status: 'pending',
        user: 'Сергей Иванов',
    },
    {
        id: 'txn_4',
        date: '2025-11-12T14:20:00.000Z',
        amount: 800,
        amountFormatted: '800 ₽',
        description: 'Покупка книги',
        status: 'completed',
        user: 'Елена Смирнова',
    },
    {
        id: 'txn_5',
        date: '2025-11-11T11:10:00.000Z',
        amount: 4500,
        amountFormatted: '4,500 ₽',
        description: 'Спорттовары',
        status: 'failed',
        user: 'Алексей Кузнецов',
    },
];

export default lastTransactionsMock;