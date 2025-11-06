import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";

import { Review } from "@/pages/index";
import { UserManagement } from "@/pages/index";
import { Analytics } from "@/pages/index";
import { Auth } from "@/pages/index";

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