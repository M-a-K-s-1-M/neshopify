"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerTrigger,
} from "@/components"
import { Input } from "@/components"
import { Label } from "@/components"
import { Plus } from "lucide-react"
import { CreateSiteForm } from "@/components"

const modalInfo = {
    title: "Создать новый сайт",
    titleBtn: "Создать сайт",
}

export default function CreateSiteModal({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={'default'} className="cursor-pointer shadow-md" >
                        <Plus />
                        {modalInfo.titleBtn}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{modalInfo.title}</DialogTitle>
                    </DialogHeader>

                    <CreateSiteForm onCreated={() => setOpen(false)} />

                    <DialogFooter>
                        <Button form="create-site-form" type="submit">Создать</Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant={'default'} className="cursor-pointer shadow-md" >
                    <Plus />
                    {modalInfo.titleBtn}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="p-4">
                <DialogHeader className="mt-5">
                    <DialogTitle className="text-center">{modalInfo.title}</DialogTitle>
                </DialogHeader>

                <div className="p-5">
                    <CreateSiteForm onCreated={() => setOpen(false)} />
                </div>

                <DrawerFooter className="pt-2">
                    <Button form="create-site-form" type="submit">Создать</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Отмена</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
    return (
        <form className={cn("grid items-start gap-6", className)}>
            <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" defaultValue="shadcn@example.com" />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@shadcn" />
            </div>
            <Button type="submit">Save changes</Button>
        </form>
    )
}
