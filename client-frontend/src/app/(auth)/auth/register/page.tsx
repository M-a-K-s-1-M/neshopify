import { RegisterForm } from "@/components";
import { Suspense } from "react";

export default function Register() {
    return (
        <Suspense fallback={null}>
            <RegisterForm />
        </Suspense>
    )
}
