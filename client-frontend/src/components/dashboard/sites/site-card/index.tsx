'use client';
import { Button, ButtonGroup, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, Separator } from "@/components";
import { Edit, Link, MoreVerticalIcon } from "lucide-react";

export function SiteCard() {
    return (
        <Card className="w-full md:max-w-lg">
            <CardHeader className="mb-3">
                <CardTitle className="mb-1">Тестовый сайт</CardTitle>
                <CardDescription>Описание</CardDescription>
                <CardAction>
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        className="cursor-pointer"
                    >
                        <MoreVerticalIcon />
                    </Button>
                </CardAction>
            </CardHeader>

            <Separator />

            <CardFooter >
                <div className="flex flex-wrap justify-between w-full gap-3">
                    <ButtonGroup>
                        <Button variant={'ghost'} size={'sm'} className=" cursor-pointer">
                            <Edit />
                        </Button>

                        <Button variant={'ghost'} size={'sm'} className="pl-0 cursor-pointer">Редактировать</Button>
                    </ButtonGroup>

                    <ButtonGroup >
                        <Button variant={'ghost'} size={'sm'} className=" cursor-pointer">
                            <Link />
                        </Button>

                        <Button variant={'ghost'} size={'sm'} className="pl-0 cursor-pointer">https://wwww.123</Button>
                    </ButtonGroup>
                </div>
            </CardFooter>
        </Card>
    )
}
