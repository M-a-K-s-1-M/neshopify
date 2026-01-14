'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockInstanceDto } from "@/lib/types";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSiteBasePath } from "@/components/providers/site-base-path-provider";
import { useEffect, useMemo, useState } from "react";

interface FieldConfig {
    label?: string;
    type?: string;
    placeholder?: string;
}

interface ActionConfig {
    label?: string;
    variant?: "default" | "outline" | string;
}

export function ProfileAccountFormBlock({ block }: { block: BlockInstanceDto }) {
    const basePath = useSiteBasePath();
    const isRuntime = Boolean(basePath);
    const isAuth = useAuthStore((s) => s.isAuth);
    const user = useAuthStore((s) => s.user);
    const updateMe = useAuthStore((s) => s.updateMe);
    const isLoading = useAuthStore((s) => s.isLoading);

    const data = block.data ?? {};
    const title = typeof data.title === "string" ? data.title : block.template.title;
    const fields = Array.isArray(data.fields) ? (data.fields as FieldConfig[]) : [];
    const actions = Array.isArray(data.actions) ? (data.actions as ActionConfig[]) : [];

    const [email, setEmail] = useState<string>("");
    const [keepCurrentPassword, setKeepCurrentPassword] = useState<boolean>(true);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const initialEmail = useMemo(() => user?.email ?? "", [user?.email]);

    // sync initial email once user loads
    useEffect(() => {
        if (!email && initialEmail) setEmail(initialEmail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialEmail]);

    const canEdit = isRuntime && isAuth;

    useEffect(() => {
        if (keepCurrentPassword) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        }
    }, [keepCurrentPassword]);

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (!canEdit) {
            setError("Нужно войти, чтобы редактировать профиль.");
            return;
        }

        const trimmedEmail = email.trim();
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError('Неверный формат email');
            return;
        }

        if (!keepCurrentPassword) {
            if (!currentPassword) {
                setError('Введите текущий пароль');
                return;
            }
            if (!newPassword) {
                setError('Введите новый пароль');
                return;
            }
            if (newPassword.length < 6) {
                setError('Пароль должен содержать минимум 6 символов');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                setError('Пароли не совпадают');
                return;
            }
            if (currentPassword === newPassword) {
                setError('Новый пароль должен отличаться от текущего');
                return;
            }
        }

        const payload: { email?: string; currentPassword?: string; newPassword?: string } = {};
        if (trimmedEmail && trimmedEmail !== initialEmail) payload.email = trimmedEmail;
        if (!keepCurrentPassword) {
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
        }

        if (!payload.email && !payload.newPassword) {
            setSuccess("Нечего сохранять");
            return;
        }

        try {
            await updateMe(payload);
            setKeepCurrentPassword(true);
            setSuccess("Сохранено");
        } catch (e) {
            setError(getRequestErrorMessage(e, "Не удалось сохранить изменения"));
        }
    };

    return (
        <section>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isRuntime ? (
                        <>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Электронная почта</Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="user@example.com"
                                    readOnly={!canEdit}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Старый пароль</Label>
                                <Input
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    type="password"
                                    placeholder="Введите старый пароль"
                                    readOnly={!canEdit || keepCurrentPassword}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Новый пароль</Label>
                                <Input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    type="password"
                                    placeholder="Введите новый пароль"
                                    readOnly={!canEdit || keepCurrentPassword}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Подтверждение пароля</Label>
                                <Input
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    type="password"
                                    placeholder="Подтвердите новый пароль"
                                    readOnly={!canEdit || keepCurrentPassword}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="keepCurrentPassword"
                                    type="checkbox"
                                    checked={keepCurrentPassword}
                                    onChange={(e) => setKeepCurrentPassword(e.target.checked)}
                                    disabled={!canEdit}
                                />
                                <Label htmlFor="keepCurrentPassword" className="text-sm font-medium">
                                    Оставить старый пароль
                                </Label>
                            </div>

                            {error ? <p className="text-sm text-destructive">{error}</p> : null}
                            {success ? <p className="text-sm text-muted-foreground">{success}</p> : null}
                        </>
                    ) : (
                        <>
                            {fields.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Добавьте поля в настройках блока.</p>
                            ) : null}
                            {fields.map((field, index) => (
                                <div key={`${field.label ?? "field"}-${index}`} className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        {field.label ?? `Поле ${index + 1}`}
                                    </Label>
                                    <Input
                                        readOnly
                                        type={field.type ?? "text"}
                                        placeholder={field.placeholder ?? "Заполните поле"}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </CardContent>

                {actions.length > 0 ? (
                    <CardFooter className="flex flex-wrap gap-3 border-t">
                        {actions.map((action, index) =>
                            (() => {
                                const label = typeof action.label === "string" ? action.label : "";
                                const isSave = label.toLowerCase().includes("сохран");

                                return (
                                    <Button
                                        key={`${action.label ?? "action"}-${index}`}
                                        variant={action.variant === "outline" ? "outline" : "default"}
                                        type="button"
                                        className="min-w-[180px]"
                                        onClick={isRuntime && isSave ? handleSave : undefined}
                                        disabled={isRuntime && isSave ? isLoading : false}
                                    >
                                        {isLoading && isRuntime && isSave ? "Сохраняем..." : action.label ?? "Действие"}
                                    </Button>
                                );
                            })(),
                        )}
                    </CardFooter>
                ) : null}
            </Card>
        </section>
    );
}
