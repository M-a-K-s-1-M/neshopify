'use client';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui";
import { usePathname } from "next/navigation";
import { Fragment } from "react/jsx-runtime";

export function BreadcrumbBlock() {
    const pathname = usePathname();
    const breadcrumbList = pathname.split("/").filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbList.map((link, index) => (
                    <Fragment key={link}>
                        <BreadcrumbItem>
                            <BreadcrumbLink className=" capitalize font-semibold text-lg md:text-xl hover:opacity-30 transition duration-300" href={`/${link}`}>{link}</BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbList?.length - 1 !== index && <BreadcrumbSeparator />}
                    </Fragment>
                ))}

            </BreadcrumbList>
        </Breadcrumb>
    )
}
