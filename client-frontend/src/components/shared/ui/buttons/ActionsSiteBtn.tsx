'use client';

import { useRouter } from "next/navigation";

import type { SiteStatus } from "@/lib/types";

import { Button, DeleteSiteBtn, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, PreviewSiteBtn, PublishSiteBtn, SettingsSiteBtn, UnpublishSiteBtn } from "@/components";
import { MoreVerticalIcon } from "lucide-react";

interface ActionsSiteBtnProps {
    siteId: string;
    status: SiteStatus;
}

export function ActionsSiteBtn({ siteId, status }: ActionsSiteBtnProps) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} size={'icon'}>
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
                <DropdownMenuGroup className="flex flex-col p-1" >

                    <DropdownMenuItem>
                        <SettingsSiteBtn href={`/sites/${siteId}/settings`} />
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => router.push(`/preview/sites/${siteId}`)}>
                        <PreviewSiteBtn
                            className="w-full justify-start"
                            href={`/preview/sites/${siteId}`}
                            onClick={() => router.push(`/preview/sites/${siteId}`)}
                        />
                    </DropdownMenuItem>

                    {status === 'PUBLISHED' ? (
                        <DropdownMenuItem>
                            <UnpublishSiteBtn className="w-full justify-start" siteId={siteId} />
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem>
                            <PublishSiteBtn className="w-full justify-start" siteId={siteId} />
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem>
                        <DeleteSiteBtn className="w-full justify-start" siteId={siteId} />
                    </DropdownMenuItem>

                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
