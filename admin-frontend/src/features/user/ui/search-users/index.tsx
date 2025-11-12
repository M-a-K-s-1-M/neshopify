import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";

export function SearchUsers() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('_users-search') || '';

    return (
        <Input placeholder="Поиск пользователей..." rightSection={<IconSearch size={20} stroke={2.5} />} />
    )
}
