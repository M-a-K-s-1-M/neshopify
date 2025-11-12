import { Input, Loader } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function SearchUsers() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search: string = searchParams.get('_users-mini-search') ?? '';
    const [searchInput, setSearchInput] = useState<string>(search);

    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = useDebouncedCallback(async (query) => {
        setLoading(true);

        if (query !== '') {
            setSearchParams({ '_users-mini-search': query })
        } else {
            searchParams.delete('_users-mini-search');
            setSearchParams(searchParams);
        }

        setLoading(false);
    }, 500);

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
        handleSearch(event.target.value);
    }

    return (
        <Input
            placeholder="Поиск пользователей..."
            rightSection={loading ? <Loader size={20} /> : <IconSearch size={20} stroke={2.5} />}
            value={searchInput}
            onChange={handleChangeInput}
        />
    )
}
