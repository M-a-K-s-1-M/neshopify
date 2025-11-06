import { Stack, Text, } from "@mantine/core"
import { NavLink, useLocation } from "react-router-dom"
import './styles.scss';


interface INavbarItem {
    label: string,
    path: string,
}

const navbarItems: INavbarItem[] = [
    { label: 'Обзор', path: '/' },
    { label: 'Управление пользователями', path: '/user-management' },
    { label: 'Аналитика', path: '/analytics' },
]
export function Navbar() {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <Stack className={"navbar"} gap={5}>
            {navbarItems?.map(navItem => {
                return <Text
                    key={navItem.label}
                    size="sm"
                    p={6}
                    bdrs={'sm'}
                    component={NavLink}
                    to={navItem.path}
                    className={pathname === navItem.path ? "navbar__link--active" : "navbar__link"}
                >
                    {navItem.label}
                </Text>
            })}

            <Stack gap={5} className={"navbar__footer"} mt={'auto'}>
                <Text
                    size="sm"
                    p={6}
                    bdrs={'sm'}
                    component={NavLink}
                    to={'/'}
                    className={pathname === '/settings' ? "navbar__link--active " : "navbar__link"}
                >
                    Настройки
                </Text>

                <Text
                    size="sm"
                    p={8}
                    bdrs={'sm'}
                    component={NavLink}
                    to={'/'}
                    className={pathname === '/exit' ? "navbar__link--active" : "navbar__link"}
                >
                    Выйти
                </Text>

            </Stack>
        </ Stack>
    )
}
