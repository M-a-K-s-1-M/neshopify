import { CustomModal } from "@/shared";

export function CreateUserModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {

    return (
        <CustomModal title="Создать пользователя" opened={opened} onClose={onClose}>
            <div>Create User Form</div>
        </CustomModal>
    )
}
