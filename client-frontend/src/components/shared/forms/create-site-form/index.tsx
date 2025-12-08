'use client'

import { Field, FieldError, FieldGroup, FieldLabel, FieldSet, Input } from "@/components";
import { ICreateSiteForm } from "@/lib";
import { Controller, SubmitHandler, useForm } from "react-hook-form"



export function CreateSiteForm() {
    const form = useForm<ICreateSiteForm>({
        mode: "onSubmit",
        defaultValues: {
            title: '',
        }

    });

    const onSubmit: SubmitHandler<ICreateSiteForm> = async (data) => {
        console.log(data);
    }

    return (
        <form id="create-site-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
                <FieldGroup>
                    <Controller
                        name="title"
                        control={form.control}
                        rules={{
                            required: 'Название сайта обязательно'
                        }}
                        render={({ field, fieldState }) => (
                            <Field className="gap-2">
                                <FieldLabel htmlFor="titleSite">Название сайта</FieldLabel>
                                <Input
                                    {...field}
                                    id="titleSite"
                                    placeholder="Мой первый сайт"
                                    autoComplete="off"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>
        </form>
    )
}
