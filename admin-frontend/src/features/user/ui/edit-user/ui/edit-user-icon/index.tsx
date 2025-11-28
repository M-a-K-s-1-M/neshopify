import { EditUserModal, type IUser, } from "@/entities/user"
import { ActionIcon } from "@mantine/core"
import { IconEdit } from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks";

export function EditUserIcon({ user }: { user: IUser }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <ActionIcon onClick={open}>
                <IconEdit />
            </ActionIcon>

            {opened && user && <EditUserModal opened={opened} close={close} user={user} />}
        </>

    )
}
