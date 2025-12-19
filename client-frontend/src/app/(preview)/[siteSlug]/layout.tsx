import { SiteBasePathProvider } from "@/components/providers/site-base-path-provider";

export default async function StorefrontSlugLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ siteSlug: string }>;
}) {
    const { siteSlug } = await params;
    const basePath = `/${siteSlug}`;

    return <SiteBasePathProvider basePath={basePath}>{children}</SiteBasePathProvider>;
}
