'use client'

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, EditInfoUserForm, Field } from '@/components'
import type { IEditInfoUserForm } from '@/lib'
import { useAuthStore } from '@/stores/useAuthStore'
import { useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'

export function EditInfoUserCard() {
    const user = useAuthStore((s) => s.user);
    const isLoading = useAuthStore((s) => s.isLoading);

    const form = useForm<IEditInfoUserForm>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
            newPassword: '',
            isCurrentPassword: true,
        },
    });

    const initialValues = useMemo(() => {
        return {
            email: user?.email ?? '',
            password: '',
            newPassword: '',
            isCurrentPassword: true,
        } satisfies IEditInfoUserForm;
    }, [user?.email]);

    useEffect(() => {
        if (user?.email) {
            form.reset(initialValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email]);

    return (
        <Card className='max-w-3xl mx-auto shadow-md'>
            <CardHeader>
                <CardTitle>Редактирование личных данных</CardTitle>
            </CardHeader>

            <CardContent>
                <EditInfoUserForm form={form} />
            </CardContent>

            <CardFooter>
                <Field orientation={'horizontal'} className='justify-between gap-3'>
                    <Button type="submit" form="edit-info-user-form" disabled={isLoading || !form.formState.isValid}>
                        {isLoading ? 'Сохраняем...' : 'Сохранить изменения'}
                    </Button>

                    <Button variant="ghost" type="button" onClick={() => form.reset(initialValues)} disabled={isLoading}>
                        Отмена
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
