import type { SessionOptions } from 'express-session';
import type { EventHandler } from 'h3';
import type { Session } from './types';
declare module 'h3' {
    interface H3EventContext {
        session: Session;
    }
}
interface SessionOptionsRedis extends SessionOptions {
    redis: {
        ttl: number;
        url: string;
    };
}
export declare function createSessionHandler(options: SessionOptionsRedis): EventHandler[];
export type { Session };
