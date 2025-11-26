import { Modal } from "@mantine/core";

export function CustomModal({ children, title, opened, onClose }:
    { children: React.ReactNode, title: string, opened: boolean, onClose: () => void }) {

    return (
        <Modal opened={opened} onClose={onClose} title={title}>{children}</Modal>
    )
}
