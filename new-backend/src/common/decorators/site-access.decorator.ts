import { SetMetadata } from '@nestjs/common';

export enum SiteAccessRequirement {
    MEMBER = 'MEMBER',
    OWNER = 'OWNER',
}

export const SITE_ACCESS_KEY = 'site_access';

/**
 * Добавляет к хендлеру требование на доступ к сайту (владельцу или любому участнику).
 */
export const SiteAccess = (requirement: SiteAccessRequirement = SiteAccessRequirement.MEMBER) =>
    SetMetadata(SITE_ACCESS_KEY, requirement);
