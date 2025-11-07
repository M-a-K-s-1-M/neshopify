export interface IAnalyticsCardVM {
    id: string;
    title: string;
    value: string;        // отформатированное значение для UI
    changeLabel?: string;    // мелкий текст под значением (например, “+5.2% за месяц”)
    icon?: React.ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}