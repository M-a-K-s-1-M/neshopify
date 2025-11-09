export type IUserStatus = 'active' | 'blocked' | 'pending' | 'invited'

export interface IUserRow {
    id: string
    name: string
    email: string
    avatar?: string | null
    plan: string
    sites: number
    status: IUserStatus
    createdAt: string // ISO date
}

export const usersMock: IUserRow[] = [
    {
        id: 'u_001',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 3,
        status: 'active',
        createdAt: '2024-09-12T10:23:00.000Z'
    },
    {
        id: 'u_002',
        name: 'Мария Сидорова',
        email: 'maria@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 1,
        status: 'active',
        createdAt: '2025-01-03T14:10:00.000Z'
    },
    {
        id: 'u_003',
        name: 'Сергей Иванов',
        email: 'sergey.ivanov@example.com',
        avatar: null,
        plan: 'Пробный',
        sites: 0,
        status: 'invited',
        createdAt: '2025-03-18T08:45:00.000Z'
    },
    {
        id: 'u_004',
        name: 'Елена Смирнова',
        email: 'elena.smirnova@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 5,
        status: 'blocked',
        createdAt: '2023-11-22T09:00:00.000Z'
    },
    {
        id: 'u_005',
        name: 'Алексей Кузнецов',
        email: 'aleksey.k@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 2,
        status: 'pending',
        createdAt: '2025-05-02T12:30:00.000Z'
    },
    {
        id: 'u_006',
        name: 'Ольга Попова',
        email: 'olga.popova@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 1,
        status: 'active',
        createdAt: '2024-06-10T16:20:00.000Z'
    },
    {
        id: 'u_007',
        name: 'Павел Егоров',
        email: 'pavel.egorov@example.com',
        avatar: null,
        plan: 'Пробный',
        sites: 0,
        status: 'pending',
        createdAt: '2025-07-01T09:15:00.000Z'
    },
    {
        id: 'u_008',
        name: 'Кирилл Орлов',
        email: 'kirill.orlov@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 4,
        status: 'active',
        createdAt: '2024-12-05T11:05:00.000Z'
    },
    {
        id: 'u_009',
        name: 'Татьяна Волкова',
        email: 't.volkova@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 2,
        status: 'active',
        createdAt: '2025-02-14T07:50:00.000Z'
    },
    {
        id: 'u_010',
        name: 'Роман Зайцев',
        email: 'roman.z@example.com',
        avatar: null,
        plan: 'Enterprise',
        sites: 12,
        status: 'active',
        createdAt: '2023-08-30T13:40:00.000Z'
    },
    {
        id: 'u_011',
        name: 'Виктория Гусева',
        email: 'v.guseva@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 6,
        status: 'active',
        createdAt: '2024-04-21T18:05:00.000Z'
    },
    {
        id: 'u_012',
        name: 'Дмитрий Савельев',
        email: 'd.savelyev@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 1,
        status: 'blocked',
        createdAt: '2024-10-11T10:10:00.000Z'
    },
    {
        id: 'u_013',
        name: 'Светлана Алексеева',
        email: 'svetlana.alex@example.com',
        avatar: null,
        plan: 'Пробный',
        sites: 0,
        status: 'invited',
        createdAt: '2025-07-20T09:00:00.000Z'
    },
    {
        id: 'u_014',
        name: 'Григорий Фомин',
        email: 'grigory.fomin@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 2,
        status: 'pending',
        createdAt: '2025-06-28T12:55:00.000Z'
    },
    {
        id: 'u_015',
        name: 'Анастасия Лебедева',
        email: 'a.lebedeva@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 7,
        status: 'active',
        createdAt: '2024-03-03T08:25:00.000Z'
    },
    {
        id: 'u_016',
        name: 'Игорь Никитин',
        email: 'igor.nikitin@example.com',
        avatar: null,
        plan: 'Enterprise',
        sites: 15,
        status: 'active',
        createdAt: '2023-07-19T16:45:00.000Z'
    },
    {
        id: 'u_017',
        name: 'Екатерина Морозова',
        email: 'k.morozova@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 3,
        status: 'active',
        createdAt: '2025-01-27T09:35:00.000Z'
    },
    {
        id: 'u_018',
        name: 'Владислав Чернов',
        email: 'v.chernov@example.com',
        avatar: null,
        plan: 'Пробный',
        sites: 0,
        status: 'invited',
        createdAt: '2025-07-05T11:11:00.000Z'
    },
    {
        id: 'u_019',
        name: 'Наталья Киселева',
        email: 'n.kiseleva@example.com',
        avatar: null,
        plan: 'Премиум',
        sites: 5,
        status: 'active',
        createdAt: '2024-05-17T15:00:00.000Z'
    },
    {
        id: 'u_020',
        name: 'Юрий Богданов',
        email: 'y.bogdanov@example.com',
        avatar: null,
        plan: 'Базовый',
        sites: 2,
        status: 'blocked',
        createdAt: '2024-11-02T13:10:00.000Z'
    }
]

export default usersMock
