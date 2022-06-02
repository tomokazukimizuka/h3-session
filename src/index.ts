import type { SessionOptions } from 'express-session'
import session from 'express-session'
import type { CompatibilityEventHandler } from 'h3'
import { defineHandler } from 'h3'

export function SessionHandler(options: SessionOptions): CompatibilityEventHandler[] {
  return [
    defineHandler((_req, res) => {
      // @ts-expect-error: Internal
      res._implicitHeader = () => {
        res.writeHead(res.statusCode)
      }
    }),
    session(options) as any,
  ]
}

export * from './types'

export type {
  SessionOptions,
}
