import type { IDashboardCard } from "@/shared/mocks/dashboardCards";
import { Box, Stack, Text } from "@mantine/core";
import styles from './styles.module.scss';

export function AnalyticsCard({ card }: { card: IDashboardCard }) {
    return (
        <Box className={styles.analytics_card} component="div" p={'lg'} miw={250} bdrs={'md'}>
            <Stack gap={2}>
                <Text className={styles.analytics_card__title}>{card.title}</Text>
                <Text size="xl" fw={700}>{card.value}</Text>
                <Text className={styles.analytics_card__change_label} size="sm">{card.changeLabel}</Text>
            </Stack>
        </Box>
    )
}
