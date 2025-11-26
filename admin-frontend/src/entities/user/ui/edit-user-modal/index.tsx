import { CustomModal } from "@/shared";

export function EditUserModal() {
    return (
        <CustomModal title="Редактировать пользователя" opened={false} close={() => { }}>
            Редактировать пользователя
        </CustomModal>
    )
}
