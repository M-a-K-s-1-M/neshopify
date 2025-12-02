import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";

import { DomainsManagement, Review, UsersManagement, Analytics, AuthLayout, Login } from "@/pages/index";
import { RequireAuth } from "../hoc";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Login />} />
            </Route>

            <Route path="/" element={
                <RequireAuth>
                    <MainLayout />
                </RequireAuth>
            }>
                <Route index element={<Review />} />

                <Route path="users-management" element={<UsersManagement />} />

                <Route path="analytics" element={<Analytics />} />

                <Route path="domains-management" element={<DomainsManagement />} />
            </Route>

            <Route path="*" element={<MainLayout />} />
        </>
    )
)

export const Router = () => <RouterProvider router={router} />