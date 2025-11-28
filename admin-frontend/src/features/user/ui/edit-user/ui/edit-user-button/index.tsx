import { EditUserModal, type IUser } from "@/entities/user";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function EditUserButton({ user, variant = 'outline' }: { user: IUser, variant?: string }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Button variant={variant} onClick={open}>Редактировать</Button>

            {opened && user && <EditUserModal opened={opened} close={close} user={user} />}
        </>
    )
}
