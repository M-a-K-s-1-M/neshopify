"use client";

import { createContext, useContext } from "react";

interface SiteBasePathContextValue {
    basePath: string;
}

const SiteBasePathContext = createContext<SiteBasePathContextValue | null>(null);

export function SiteBasePathProvider({
    basePath,
    children,
}: {
    basePath: string;
    children: React.ReactNode;
}) {
    return (
        <SiteBasePathContext.Provider value={{ basePath }}>
            {children}
        </SiteBasePathContext.Provider>
    );
}

export function useSiteBasePath() {
    return useContext(SiteBasePathContext)?.basePath ?? "";
}

function isExternalHref(href: string) {
    return (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
    );
}

export function resolveSiteHref(href: string | undefined, basePath: string) {
    if (!href) return "#";
    const trimmed = href.trim();
    if (!trimmed) return "#";
    if (trimmed === "#") return "#";
    if (trimmed.startsWith("#")) return trimmed;
    if (isExternalHref(trimmed)) return trimmed;

    const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

    if (trimmed === "/") {
        return normalizedBase || "/";
    }

    if (trimmed.startsWith("/")) {
        if (normalizedBase && trimmed.startsWith(normalizedBase + "/")) {
            return trimmed;
        }
        return normalizedBase ? `${normalizedBase}${trimmed}` : trimmed;
    }

    const normalizedHref = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return normalizedBase ? `${normalizedBase}${normalizedHref}` : normalizedHref;
}
