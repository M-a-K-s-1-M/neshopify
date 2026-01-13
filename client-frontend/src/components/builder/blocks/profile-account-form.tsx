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
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const initialEmail = useMemo(() => user?.email ?? "", [user?.email]);

    // sync initial email once user loads
    useEffect(() => {
        if (!email && initialEmail) setEmail(initialEmail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialEmail]);

    const canEdit = isRuntime && isAuth;

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (!canEdit) {
            setError("Нужно войти, чтобы редактировать профиль.");
            return;
        }

        if (password && password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        const payload: { email?: string; password?: string } = {};
        const trimmedEmail = email.trim();
        if (trimmedEmail && trimmedEmail !== initialEmail) payload.email = trimmedEmail;
        if (password) payload.password = password;

        if (!payload.email && !payload.password) {
            setSuccess("Нечего сохранять");
            return;
        }

        try {
            await updateMe(payload);
            setPassword("");
            setConfirmPassword("");
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
                                <Label className="text-sm font-medium">Новый пароль</Label>
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    readOnly={!canEdit}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Подтверждение пароля</Label>
                                <Input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    readOnly={!canEdit}
                                />
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
