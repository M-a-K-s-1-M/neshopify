import { LoginForm } from "@/components";
import { Suspense } from "react";

export default function Login() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    )
}
