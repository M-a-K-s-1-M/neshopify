'use client';

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { Button } from "@/components";
import { PagesApi } from "@/lib/api/pages";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";

interface DeletePageBtnProps {
    siteId: string;
    pageId: string;
}

export function DeletePageBtn({ siteId, pageId }: DeletePageBtnProps) {
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () => PagesApi.remove(siteId, pageId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.sitePages(siteId) });
            setErrorMessage(null);
        },
        onError: (error) => {
            const message = getRequestErrorMessage(error, "Не удалось удалить страницу");
            setErrorMessage(message);
            window.alert(message);
        },
    });

    const handleDelete = () => {
        if (mutation.isPending) {
            return;
        }
        if (!window.confirm("Удалить страницу?")) {
            return;
        }
        mutation.mutate();
    };

    return (
        <Button
            variant={'ghost'}
            type="button"
            onClick={handleDelete}
            disabled={mutation.isPending}
            title={errorMessage ?? undefined}
        >
            <Trash2 />
            {mutation.isPending ? "Удаляем..." : "Удалить"}
        </Button>
    );
}
