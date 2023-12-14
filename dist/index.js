import session from 'express-session';
import { eventHandler, fromNodeMiddleware } from 'h3';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
export function createSessionHandler(options) {
    // Redisの設定がある場合のみoptionsに追加する
    if (options && Object.prototype.hasOwnProperty.call(options, 'redis')) {
        const redisClient = createClient({ url: options.redis.url ?? 'redis://localhost:6379' });
        redisClient.connect().catch(console.error);
        const RedisStore = connectRedis(session);
        const redisStore = new RedisStore({
            // @ts-expect-error ___
            client: redisClient,
            ttl: options.redis.ttl,
        });
        options.store = redisStore;
    }
    return [
        eventHandler((event) => {
            event.node.res._implicitHeader = () => {
                event.node.res.writeHead(event.node.res.statusCode);
            };
        }),
        fromNodeMiddleware(session(options)),
        eventHandler((event) => {
            event.context.session = event.node.req.session;
            event.context.session.regeneratePromisified = () => new Promise((resolve, reject) => {
                // @ts-expect-error: Session missing types
                event.node.req.session.regenerate((err) => {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            });
            event.context.session.destroyPromisified = () => new Promise((resolve, reject) => {
                // @ts-expect-error: Session missing types
                event.node.req.session.destroy((err) => {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            });
            event.context.session.reloadPromisified = () => new Promise((resolve, reject) => {
                // @ts-expect-error: Session missing types
                event.node.req.session.reload((err) => {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            });
            event.context.session.savePromisified = () => new Promise((resolve, reject) => {
                // @ts-expect-error: Session missing types
                event.node.req.session.save((err) => {
                    if (err)
                        return reject(err);
                    resolve(true);
                });
            });
        }),
    ];
}
