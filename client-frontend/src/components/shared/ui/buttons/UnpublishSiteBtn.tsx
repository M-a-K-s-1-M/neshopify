'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { Button } from "@/components/ui";
import { SitesApi } from "@/lib/api/sites";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { getRequestErrorMessage } from "@/lib/utils/error";

export function UnpublishSiteBtn({
    siteId,
    className,
    onSuccess,
}: {
    siteId: string;
    className?: string;
    onSuccess?: () => void;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => SitesApi.unpublish(siteId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.sites() }),
                queryClient.invalidateQueries({ queryKey: queryKeys.site(siteId) }),
            ]);
            onSuccess?.();
        },
        onError: (error) => {
            window.alert(getRequestErrorMessage(error, "Не удалось снять сайт с публикации"));
        },
    });

    return (
        <Button
            type="button"
            variant={'outline'}
            className={cn(className)}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
        >
            <Download className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Снимаем..." : "Снять с публикации"}
        </Button>
    );
}
