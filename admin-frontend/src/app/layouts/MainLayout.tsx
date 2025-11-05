import { Header } from "@/widgets/header";
import { Navbar } from "@/widgets/navbar";
import { AppShell, Avatar, Burger, Flex, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavLink, Outlet } from "react-router-dom";


interface InavbarItem {
    label: string,
    path: string,
}

const navbarItems: InavbarItem[] = [
    { label: 'Обзор', path: '/' },
    { label: 'Управление пользователями', path: '/user-management' },
    { label: 'Аналитика', path: '/analytics' },
]

export function MainLayout() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: '3.5rem' }}
            navbar={{
                width: 255,
                breakpoint: 'sm',
                collapsed: { mobile: !opened }
            }}
        >
            <AppShell.Header
                p={'sm'}
            >
                <Header opened={opened} toggle={toggle} />
            </AppShell.Header>

            <AppShell.Navbar
                p={'sm'}
            >
                <Navbar />
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    )
}