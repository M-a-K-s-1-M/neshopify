import { SiteBasePathProvider } from "@/components/providers/site-base-path-provider";

export default async function PreviewSiteLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ siteId: string }>;
}) {
    const { siteId } = await params;
    const basePath = `/preview/sites/${siteId}`;

    return <SiteBasePathProvider basePath={basePath}>{children}</SiteBasePathProvider>;
}
