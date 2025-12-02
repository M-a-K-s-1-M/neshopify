import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../stores";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { isAuth } = useAuth();

    if (!isAuth) {
        return <Navigate to='/auth' state={{ from: location }} />
    }

    return children;
}
