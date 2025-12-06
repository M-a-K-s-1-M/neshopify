'use client'
import { useParams } from "next/navigation"

export default function Site() {
    const params = useParams();

    return (
        <div>{params.siteId}</div>
    )
}
