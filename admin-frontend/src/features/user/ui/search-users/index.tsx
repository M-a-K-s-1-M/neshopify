import { Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function SearchUsers() {
    return (
        <Input placeholder="Поиск пользователей..." rightSection={<IconSearch size={20} stroke={2.5} />} />
    )
}
