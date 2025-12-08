'use client';
import { useState } from "react";
import dynamic from "next/dynamic";

const CreateSiteModal = dynamic(
    () => import("@/components/dashboard/modals/create-site-modal/index"),
    { ssr: false }
);

export function CreateSiteBtn() {
    const [open, setOpen] = useState(false)

    return (
        <CreateSiteModal open={open} setOpen={setOpen} />
    )
}
