import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, RolesGuard, SiteAccessGuard } from '../../common/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { SiteAccess, SiteAccessRequirement } from '../../common/decorators/site-access.decorator';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
    RemovedResponseDto,
    SiteMemberResponseDto,
    SiteResponseDto,
} from 'src/common/swagger/api-models';

@Controller('sites')
@ApiTags('Sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SitesController {
    constructor(private readonly sitesService: SitesService) { }

    private getUser(req: Request) {
        const user = req.user as { sub: string; roles?: string[] } | undefined;
        if (!user) {
            throw new UnauthorizedException('Необходима авторизация');
        }
        return user;
    }

    @Post()
    @Roles('SITE_OWNER', 'ADMIN')
    @UseGuards(RolesGuard)
    @ApiCreatedResponse({ type: SiteResponseDto })
    async create(@Req() req: Request, @Body() dto: CreateSiteDto) {
        const user = this.getUser(req);
        return this.sitesService.create(user.sub, dto);
    }

    @Get()
    @ApiOkResponse({ type: SiteResponseDto, isArray: true })
    async findAll(@Req() req: Request) {
        const user = this.getUser(req);
        return this.sitesService.findAllForUser(user.sub, user.roles ?? []);
    }

    @Get(':id')
    @SiteAccess(SiteAccessRequirement.MEMBER)
    @UseGuards(SiteAccessGuard)
    @ApiOkResponse({ type: SiteResponseDto })
    async findOne(@Param('id') id: string) {
        return this.sitesService.findById(id);
    }

    @Patch(':id')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteResponseDto })
    async update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
        return this.sitesService.update(id, dto);
    }

    @Delete(':id')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteResponseDto })
    async remove(@Param('id') id: string) {
        return this.sitesService.remove(id);
    }

    @Get(':id/members')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteMemberResponseDto, isArray: true })
    async members(@Param('id') id: string) {
        return this.sitesService.listMembers(id);
    }

    @Post(':id/members')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiCreatedResponse({ type: SiteMemberResponseDto })
    async addMember(@Param('id') id: string, @Req() req: Request, @Body() dto: AddMemberDto) {
        const user = this.getUser(req);
        return this.sitesService.addMember(id, dto, user.sub);
    }

    @Patch(':id/members/:memberId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: SiteMemberResponseDto })
    async updateMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.sitesService.updateMemberRole(id, memberId, dto);
    }

    @Delete(':id/members/:memberId')
    @Roles('SITE_OWNER', 'ADMIN')
    @SiteAccess(SiteAccessRequirement.OWNER)
    @UseGuards(RolesGuard, SiteAccessGuard)
    @ApiOkResponse({ type: RemovedResponseDto })
    async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
        return this.sitesService.removeMember(id, memberId);
    }
}
