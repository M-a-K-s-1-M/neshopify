// SearchUsersWithFilters.tsx
import { ActionIcon, Box, Flex, Group, Loader, MultiSelect, Select, TextInput } from "@mantine/core";
import { IconDownload, IconFilter, IconSearch } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { RolesService } from "@/shared";
import { useUsersFilters } from "@/entities";

export function SearchWithFilters() {
    const { search, roles, banned, update } = useUsersFilters();

    // Локальный стейт для текста — чтобы ввод отображался мгновенно
    const [inputValue, setInputValue] = useState(search);

    // Состояние загрузки индикатора в инпуте (показать loader при debounce запросе)
    const [loading, setLoading] = useState(false);

    // Подтянуть роли с сервера (для MultiSelect)
    const { data: allRoles } = useQuery({
        queryKey: ["roles"],
        queryFn: () => RolesService.getAll(),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // дебаунс — обновляет URL с задержкой
    const debounced = useDebouncedCallback((q: string) => {
        setLoading(true);
        update("search", q.trim() === "" ? "" : q);
        setLoading(false);
    }, 500);

    // если перезагрузили страницу и search из URL отличается от локального inputValue — синхронизируем
    useEffect(() => {
        setInputValue(search);
    }, [search]);

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setInputValue(v);
        debounced(v);
    };

    return (
        <Box p="lg" className="search-users-with-filters">
            <Flex justify="space-between" align="center" gap="sm">
                <Group>
                    <TextInput
                        type="search"
                        placeholder="Поиск пользователей..."
                        leftSection={loading ? <Loader size={18} /> : <IconSearch size={16} />}
                        value={inputValue}
                        onChange={onChangeInput}
                        w={250}
                    />

                    <MultiSelect
                        placeholder="Роли"
                        data={allRoles ? allRoles.map(r => r.value) : []}
                        value={roles}
                        onChange={(vals) => update("roles", vals.length ? vals.join(",") : "")}
                        w={260}
                    />

                    <Select
                        placeholder="Статус"
                        data={[
                            { value: "", label: "Все" },
                            { value: "false", label: "Активные" },
                            { value: "true", label: "Заблокированные" }
                        ]}
                        value={banned}
                        onChange={(v) => update("banned", v ?? "")}
                        w={200}
                    />
                </Group>

                <Group>
                    <ActionIcon variant="outline"><IconFilter size={18} /></ActionIcon>
                    <ActionIcon variant="outline"><IconDownload size={18} /></ActionIcon>
                </Group>
            </Flex>
        </Box>
    );
}
