import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function CustomModal({ children, title }: { children: React.ReactNode, title: string }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <Modal opened={opened} onClose={close} title={title}>{children}</Modal>
    )
}
