import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../stores";
import { useEffect, useState } from "react";

interface RequireAuthProps {
    children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const location = useLocation();
    const { isAuth, refresh, } = useAuth(); // используем checkAuth из zustand

    const [isLoading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            try {
                await refresh(); // делает refresh через cookie, обновляет state
            } catch (e) {
                // ошибка авторизации, user останется null
                navigate("/auth", { state: { from: location }, replace: true });
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [refresh, navigate, location]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuth) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}