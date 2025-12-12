function getApiBase(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
    if (!apiUrl) return "";
    return apiUrl.replace(/\/api\/?$/, "");
}

export function resolveMediaUrl(url: string): string {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;

    const base = getApiBase();
    if (base && url.startsWith("/")) {
        return `${base}${url}`;
    }

    return url;
}
