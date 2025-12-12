'use client'

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, EditInfoUserForm, Field } from '@/components'
import type { IEditInfoUserForm } from '@/lib'
import { useForm } from 'react-hook-form'

export function EditInfoUserCard() {
    const form = useForm<IEditInfoUserForm>({
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
            newPassword: '',
            isCurrentPassword: true,
        },
    });

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
                    <Button type="submit" form="edit-info-user-form">Сохранить изменения</Button>

                    <Button variant="ghost" form="edit-info-user-form" onClick={() => form.reset()}>Отмена</Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
