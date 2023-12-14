import type { SessionOptions } from 'express-session'
import session from 'express-session'
import { eventHandler, fromNodeMiddleware } from 'h3'
import type { EventHandler, NodeMiddleware } from 'h3'
import connectRedis from 'connect-redis'
import { createClient } from 'redis'
import type { Session } from './types'
declare module 'h3' {
  interface H3EventContext {
    session: Session
  }
}
interface SessionOptionsRedis extends SessionOptions {
  redis: {
    ttl: number
    url: string
  }
}

export function createSessionHandler(options: SessionOptionsRedis): EventHandler[] {
  // Redisの設定がある場合のみoptionsに追加する
  if (options && Object.prototype.hasOwnProperty.call(options, 'redis')) {
    const redisClient = createClient({ url: options.redis.url ?? 'redis://localhost:6379' })
    redisClient.connect().catch(console.error)
    const RedisStore: connectRedis.RedisStore = connectRedis(session)
    const redisStore = new RedisStore({
      client: redisClient,
      ttl: options.redis.ttl,
    })
    options.store = redisStore
  }
  return [
    eventHandler((event) => {
      (event.node.res as any)._implicitHeader = () => {
        event.node.res.writeHead(event.node.res.statusCode)
      }
    }),
    fromNodeMiddleware(session(options) as NodeMiddleware),
    eventHandler((event) => {
      event.context.session = (event.node.req as any).session

      event.context.session.regeneratePromisified = () => new Promise((resolve, reject) => {
        // @ts-expect-error: Session missing types
        event.node.req.session.regenerate((err: Error) => {
          if (err)
            return reject(err)

          resolve(true)
        })
      })

      event.context.session.destroyPromisified = () => new Promise((resolve, reject) => {
        // @ts-expect-error: Session missing types
        event.node.req.session.destroy((err: Error) => {
          if (err)
            return reject(err)

          resolve(true)
        })
      })

      event.context.session.reloadPromisified = () => new Promise((resolve, reject) => {
        // @ts-expect-error: Session missing types
        event.node.req.session.reload((err: Error) => {
          if (err)
            return reject(err)

          resolve(true)
        })
      })

      event.context.session.savePromisified = () => new Promise((resolve, reject) => {
        // @ts-expect-error: Session missing types
        event.node.req.session.save((err: Error) => {
          if (err)
            return reject(err)

          resolve(true)
        })
      })
    }),
  ]
}

export type { Session }
