'use client'

const CART_SESSION_ID_KEY = 'neshopify.cart.sessionId';

function fallbackUuid(): string {
    return `sess_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateCartSessionId(): string {
    if (typeof window === 'undefined') {
        // Эта утилита должна вызываться только на клиенте.
        return '';
    }

    const existing = window.localStorage.getItem(CART_SESSION_ID_KEY);
    if (existing) return existing;

    const sessionId = typeof window.crypto?.randomUUID === 'function' ? window.crypto.randomUUID() : fallbackUuid();
    window.localStorage.setItem(CART_SESSION_ID_KEY, sessionId);
    return sessionId;
}
