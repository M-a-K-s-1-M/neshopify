"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

export function AuthBootstrap({ children }: { children: ReactNode }) {
    const refresh = useAuthStore((s) => s.refresh);
    const isAuth = useAuthStore((s) => s.isAuth);
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        if (!isAuth) {
            void refresh();
        }
    }, [isAuth, refresh]);

    return <>{children}</>;
}
