// useUsersFilters.ts
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { IUser } from "../models";

export function useUsersFilters() {
    const [params, setParams] = useSearchParams();

    // PAGE & LIMIT
    const page = Number(params.get("page") || 1);
    const limit = Number(params.get("limit") || 7);

    // SEARCH
    const search = params.get("search") ?? "";

    // ROLES: 2 представления -- массив (для MultiSelect) и строка (для queryKey и сервера)
    const rolesInString = params.get("roles") ?? "";
    const roles = rolesInString ? rolesInString.split(",").filter(Boolean) : [];

    // BANNED: хранится в URL как 'true'|'false' или отсутствует
    const bannedRaw = params.get("banned");
    const banned = bannedRaw ?? ""; // "" | "true" | "false"
    const bannedBoolean = banned === "true" ? true : banned === "false" ? false : undefined;

    // SELECTED IDS
    const selectedIds = params.get("selectedIds") ?? "";
    const selectedIdsArray = selectedIds ? selectedIds.split(",").filter(Boolean) : [];

    // Проверяем — выбраны ли все
    const isCheckedAll = (users: IUser[]) => {
        return users.length > 0 && users.every(u => selectedIdsArray.includes(u.id));
    }

    // Проверяем — выбрана часть (режим "-" у чекбокса)
    const isIndeterminate = (users: IUser[]) => {
        return users.some(u => selectedIdsArray.includes(u.id)) && !isCheckedAll(users);
    };

    // Обрабатываем клик "выбрать все"
    const toggleAll = (checked: boolean, users: IUser[]) => {
        if (checked) {
            // Добавляем всех пользователей с текущей страницы
            const newIds = Array.from(new Set([...selectedIdsArray, ...users.map(u => u.id)]));
            update("selectedIds", newIds.join(","));
        } else {
            // Убираем всех пользователей текущей страницы
            const filtered = selectedIdsArray.filter(id => !users.some(u => u.id === id));
            update("selectedIds", filtered.join(","));
        }
    };

    const reset = () => {
        setParams((params) => {
            const next = new URLSearchParams(params);

            // базовые параметры (если хочешь)
            next.set("page", "1");
            next.delete("search");
            next.delete("roles");
            next.delete("banned");
            next.delete("selectedIds");

            return next;
        });
    }


    // update: универсальная функция для изменения URL-параметра.
    // Если меняется любой фильтр (ключ !== 'page'), мы автоматически сбрасываем страницу на 1.
    const update = (key: string, value: any) => {
        setParams(prev => {
            const next = new URLSearchParams(prev);

            // удаляем пустые значения (удаляем параметр из URL)
            const isEmpty = value === "" || value === null || (Array.isArray(value) && value.length === 0);
            if (isEmpty) {
                next.delete(key);
            } else {
                next.set(key, String(value));
            }

            // если меняется не page, то сбрасываем страницу на 1
            if (key !== "page" && key !== 'selectedIds') {
                next.delete('selectedIds');
                next.set("page", "1");
            }


            return next;
        });
    };

    // мемоизация возвращаемых значений (необязательно но удобно)
    return useMemo(() => ({
        page,
        limit,
        search,
        roles,
        rolesInString,
        banned,
        bannedBoolean,
        isCheckedAll,
        isIndeterminate,
        toggleAll,
        update,
        reset,
        selectedIds,
        selectedIdsArray,
    }), [page, limit, search, rolesInString, banned, bannedBoolean, selectedIds, selectedIdsArray]);
}
