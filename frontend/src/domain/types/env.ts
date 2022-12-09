export type Self = Window &
  typeof globalThis & {
    env: Record<string, string>
  }
