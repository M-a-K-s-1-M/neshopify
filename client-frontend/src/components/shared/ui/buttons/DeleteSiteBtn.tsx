'use client'

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { SitesApi } from "@/lib/api/sites";
import { queryKeys } from "@/lib/query/keys";
import { getRequestErrorMessage } from "@/lib/utils/error";

interface DeleteSiteBtnProps {
    siteId: string;
    className?: string;
    redirectTo?: string;
}

export function DeleteSiteBtn({ siteId, className, redirectTo }: DeleteSiteBtnProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: () => SitesApi.remove(siteId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.sites() }),
                queryClient.invalidateQueries({ queryKey: queryKeys.site(siteId) }),
            ]);
            setErrorMessage(null);
            if (redirectTo) {
                router.push(redirectTo);
            }
        },
        onError: (error) => {
            const message = getRequestErrorMessage(error, "Не удалось удалить сайт");
            setErrorMessage(message);
            window.alert(message);
        },
    });

    const handleDelete = () => {
        if (deleteMutation.isPending) {
            return;
        }
        const confirmed = window.confirm("Удалить сайт? Это действие нельзя отменить.");
        if (!confirmed) {
            return;
        }
        deleteMutation.mutate();
    };

    return (
        <Button
            type="button"
            variant={'destructive'}
            className={cn(className)}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title={errorMessage ?? undefined}
        >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteMutation.isPending ? "Удаляем..." : "Удалить"}
        </Button>
    );
}
