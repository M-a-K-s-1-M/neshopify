import { Header } from "@/widgets/header";
import { Navbar } from "@/widgets/navbar";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";


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