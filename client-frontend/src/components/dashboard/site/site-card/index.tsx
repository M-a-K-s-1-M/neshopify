'use client';
import { ActionsSiteBtn, Button, ButtonGroup, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, Separator } from "@/components";
import { Edit, Link as LinkIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

export function SiteCard() {
    return (
        <Card className="w-full md:max-w-lg shadow-md">
            <CardHeader className="mb-3">
                <CardTitle className="mb-1">Тестовый сайт</CardTitle>
                <CardDescription>Описание</CardDescription>
                <CardAction>
                    <ActionsSiteBtn />
                </CardAction>
            </CardHeader>

            <Separator />

            <CardFooter >
                <div className="flex flex-wrap justify-between w-full gap-3">
                    <ButtonGroup >
                        <Button variant={'ghost'} size={'sm'} className=" cursor-pointer" asChild>
                            <Link href="/sites/siteId">
                                <Edit />
                            </Link>
                        </Button>

                        <Button variant={'ghost'} size={'sm'} className="pl-0 cursor-pointer" asChild>
                            <Link href='/sites/siteId'>
                                Редактировать
                            </Link>
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup >
                        <Button variant={'ghost'} size={'sm'} className=" cursor-pointer" asChild>
                            <Link href="/">
                                <LinkIcon />
                            </Link>
                        </Button>

                        <Button variant={'ghost'} size={'sm'} className="pl-0 cursor-pointer" asChild>
                            <Link href='/'>
                                https://wwww.123
                            </Link>
                        </Button>
                    </ButtonGroup>
                </div>
            </CardFooter>
        </Card>
    )
}
