declare module 'stripe' {
    class Stripe {
        constructor(secretKey: string, config?: any);

        webhooks: {
            constructEvent: (...args: any[]) => Stripe.Event;
        };

        checkout: {
            sessions: {
                create: (...args: any[]) => Promise<any>;
            };
        };
    }

    namespace Stripe {
        // Минимальные типы, чтобы TS компилировал проект даже если node_modules отсутствует.
        // При установленном пакете `stripe` эти объявления обычно перекрываются реальными типами.
        type Event = any;
    }

    export default Stripe;
}
