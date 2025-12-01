import { RolesService } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { ICreateUserForm, IUser } from "../models";
import { useState } from "react";
import type { IUpdateUserForm } from "../models/IUpdateUserForm";

export const useUserForm = <T extends ICreateUserForm | IUpdateUserForm>() => {
    const { data, isPending, isError } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            // const response = await RolesService.getAll();
            // return response.data;
            return await RolesService.getAll();
        },
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchOnReconnect: true,

    });

    const [isCurrentPassword, setIsCurrentPassword] = useState(true);


    const { register, handleSubmit, formState, control, reset, getValues } = useForm<T>({
        mode: 'onSubmit',
    })

    const arrRoles = data ? data.map((role: { id: string; value: string }) => role.value) : [];
    const emailError = formState.errors.email?.message;
    const passwordError = formState.errors.password?.message;


    const isChangend = (data: IUpdateUserForm, initialUser: IUser) => {
        if (!initialUser) return true;
        const initialRoles = initialUser.userRoles.map(userRole => userRole.role?.value).sort();
        const newRoles = [...data.roles].sort();

        const isRolesChanged = JSON.stringify(initialRoles) !== JSON.stringify(newRoles);
        const isEmailChanged = data.email !== initialUser.email;
        const isPasswordChanged = !isCurrentPassword && data.password && data.password.length > 0;

        return isRolesChanged || isEmailChanged || isPasswordChanged;

    }


    return {
        getValues,
        register,
        handleSubmit,
        formState,
        control,
        reset,
        isPending,
        isError,
        isCurrentPassword,
        setIsCurrentPassword,
        arrRoles,
        emailError,
        passwordError,
        isChangend,
    }
}