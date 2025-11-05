import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Review } from "@/pages/review";
import { MainLayout } from "@/app/layouts/MainLayout";
import { UserManagement } from "@/pages/user-management";
import { Analytics } from "@/pages/analytics";
import { Auth } from "@/pages/auth";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/auth" element={<Auth />} />

            <Route path="/" element={<MainLayout />}>
                <Route index element={<Review />} />

                <Route path="user-management" element={<UserManagement />} />

                <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<MainLayout />} />
        </>
    )
)

export const Router = () => <RouterProvider router={router} />