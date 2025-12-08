'use client';
import { DeletePageBtn, EditPageBtn, Item, ItemActions, ItemContent, ItemDescription, ItemTitle, } from "@/components";

export function PageCard() {
    return (
        <Item variant={'muted'} className="shadow-md">
            <ItemContent>
                <ItemTitle>Страница 1</ItemTitle>
            </ItemContent>

            <ItemContent>
                <ItemDescription>Главная страница</ItemDescription>
            </ItemContent>

            <ItemActions className=" md:border-l ">
                <EditPageBtn />
                <DeletePageBtn />
            </ItemActions>
        </Item>
    )
}
