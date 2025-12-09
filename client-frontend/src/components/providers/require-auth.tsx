'use client'

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface RequireAuthProps {
    children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const router = useRouter();
    const refresh = useAuthStore((state) => state.refresh);
    const isAuth = useAuthStore((state) => state.isAuth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let mounted = true;

        const verify = async () => {
            const payload = await refresh();

            if (!payload) {
                router.replace('/auth');
            }

            if (mounted) {
                setIsChecking(false);
            }
        };

        verify();

        return () => {
            mounted = false;
        };
    }, [refresh, router]);

    if (isChecking) {
        return (
            <div className="flex min-h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
                Проверяем доступ...
            </div>
        );
    }

    if (!isAuth) {
        return null;
    }

    return <>{children}</>;
}
