'use client';

import { Button, DeleteSiteBtn, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger, SettingsSiteBtn } from "@/components";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";

interface ActionsSiteBtnProps {
    siteId: string;
}

export function ActionsSiteBtn({ siteId }: ActionsSiteBtnProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} size={'icon'}>
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end'>
                <DropdownMenuGroup className="flex flex-col gap-2 p-1" >

                    <DropdownMenuItem>
                        <SettingsSiteBtn href={`/sites/${siteId}/settings`} />
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <DeleteSiteBtn className="w-full justify-start" siteId={siteId} />
                    </DropdownMenuItem>

                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
