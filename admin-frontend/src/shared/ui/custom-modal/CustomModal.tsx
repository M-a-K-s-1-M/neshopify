import { Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function CustomModal({ children, title, opened, close, size }:
    { children: React.ReactNode, title: string, opened: boolean, close: () => void, size?: string }) {

    const isMobile = useMediaQuery('(max-width: 50em)');

    return (
        <Modal
            opened={opened}
            onClose={close}
            title={title}
            size={size || "lg"}
            radius={'md'}
            fullScreen={isMobile}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            yOffset={100}
        >
            {children}
        </Modal>
    )
}
