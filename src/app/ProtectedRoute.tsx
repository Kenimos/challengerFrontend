import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isExpired } from "../shared/lib/jwt";

export default function ProtectedRoute() {
    const loc = useLocation();
    const token = localStorage.getItem("auth_token");

    if (!token || isExpired(token)) {
        // smazat staré věci
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");

        // redirect na login a zachovat kam jsme chtěli jít
        return <Navigate to="/login" replace state={{ from: loc }} />;
    }

    return <Outlet />;
}
