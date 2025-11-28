import { RolesService } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { ICreateUserForm } from "../models";
import { useState } from "react";
import type { IUpdateUserForm } from "../models/IUpdateUserForm";

export const useUserForm = <T extends ICreateUserForm | IUpdateUserForm>() => {
    const { data, isPending, isError } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await RolesService.getAll();
            return response.data;
        }
    });

    const [isCurrentPassword, setIsCurrentPassword] = useState(true);


    const { register, handleSubmit, formState, control, reset, } = useForm<T>({
        mode: 'onSubmit',
    })

    const arrRoles = data ? data.map((role: { id: string; value: string }) => role.value) : [];
    const emailError = formState.errors.email?.message;
    const passwordError = formState.errors.password?.message;


    return {
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
    }
}