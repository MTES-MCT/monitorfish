import { Env } from './env'

export type Self = Window &
  typeof globalThis & {
    env: Record<Env, string>
  }
