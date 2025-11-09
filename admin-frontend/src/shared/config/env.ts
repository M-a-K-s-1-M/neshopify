// Типы для TypeScript
// interface ImportMetaEnv {
//     readonly VITE_API_URL: string;
//     readonly VITE_APP_NAME: string;
//     readonly VITE_DEBUG: string;
//     readonly MODE: 'development' | 'production';
// }

// Конфиг окружения
export const env = {
    // API настройки
    api: {
        url: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        timeout: 10000,
    },

    // Приложение
    app: {
        name: import.meta.env.VITE_APP_NAME || 'Admin Panel',
        version: '1.0.0',
    },

    // Окружение
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    debug: import.meta.env.VITE_DEBUG === 'true',

    // Получить полный URL для API
    apiUrl: (path: string = '') => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        return `${baseUrl}${path}`;
    },
} as const;