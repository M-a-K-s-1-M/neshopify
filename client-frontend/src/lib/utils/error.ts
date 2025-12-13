import axios from "axios";

export function getRequestErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return "Ошибка сети: не удалось подключиться к API. Проверьте, что запущен new-backend (обычно http://localhost:5000) и что NEXT_PUBLIC_API_URL указывает на /api.";
        }
        const data = error.response?.data as { message?: string } | undefined;
        if (data?.message) {
            return data.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
