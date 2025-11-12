import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";

import { DomainsManagement, Review, UsersManagement, Analytics, Auth } from "@/pages/index";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/auth" element={<Auth />} />

            <Route path="/" element={<MainLayout />}>
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