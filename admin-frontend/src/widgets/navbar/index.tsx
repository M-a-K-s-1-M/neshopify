import { Stack, } from "@mantine/core"
import { NavLink } from "react-router-dom"
import styles from './styles.module.scss';


interface InavbarItem {
    label: string,
    path: string,
}

const navbarItems: InavbarItem[] = [
    { label: 'Обзор', path: '/' },
    { label: 'Управление пользователями', path: '/user-management' },
    { label: 'Аналитика', path: '/analytics' },
]
export function Navbar() {


    return (
        <Stack className={styles.navbar}>
            {navbarItems?.map(navItem => {
                return <NavLink
                    className={({ isActive }) => isActive ? styles.navbar__link_active : styles.navbar__link}
                    key={navItem.label}
                    to={navItem.path}>
                    {navItem.label}
                </NavLink>
            })}
        </ Stack>
    )
}
