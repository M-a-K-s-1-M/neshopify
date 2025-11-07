export type DomainStatus = 'active' | 'expiring' | 'expired' | 'suspended'

export interface IDomainRow {
    id: string
    domain: string
    ownerEmail: string
    status: DomainStatus
    expiresAt: string // ISO date, форматируйте в UI (e.g. 15.12.2024)
}

export const domainsMock: IDomainRow[] = [
    {
        id: 'd_001',
        domain: 'example-shop.ru',
        ownerEmail: 'ivan@example.com',
        status: 'active',
        expiresAt: '2024-12-15T00:00:00.000Z',
    },
    {
        id: 'd_002',
        domain: 'mybusiness.com',
        ownerEmail: 'maria@example.com',
        status: 'active',
        expiresAt: '2025-01-03T00:00:00.000Z',
    },
    {
        id: 'd_003',
        domain: 'coolbrand.store',
        ownerEmail: 'support@coolbrand.store',
        status: 'expiring', // истекает скоро
        expiresAt: '2024-11-20T00:00:00.000Z',
    },
    {
        id: 'd_004',
        domain: 'archi-dev.io',
        ownerEmail: 'admin@archi-dev.io',
        status: 'expired',
        expiresAt: '2024-08-01T00:00:00.000Z',
    },
    {
        id: 'd_005',
        domain: 'nova-market.app',
        ownerEmail: 'owner@nova-market.app',
        status: 'suspended',
        expiresAt: '2025-04-10T00:00:00.000Z',
    },
]

export default domainsMock
