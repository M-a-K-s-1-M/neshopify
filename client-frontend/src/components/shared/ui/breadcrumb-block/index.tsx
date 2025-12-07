'use client';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui";
import { usePathname } from "next/navigation";

export function BreadcrumbBlock() {
    const pathname = usePathname();
    const breadcrumbList = pathname.split("/").filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbList.map((link, index) => (
                    <div key={link}>
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-white capitalize font-semibold text-xl hover:text-muted-foreground transition duration-300" href={`/${link}`}>{link}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbList?.length - 1 !== index && <BreadcrumbSeparator />}
                    </div>
                ))}

            </BreadcrumbList>
        </Breadcrumb>
    )
}
