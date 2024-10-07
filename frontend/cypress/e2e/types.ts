export type OrUndefinedToOrNull<T> =
  T extends Array<infer U>
    ? Array<OrUndefinedToOrNull<U>>
    : T extends object
      ? {
          [K in keyof T]: OrUndefinedToOrNull<T[K]> extends infer U ? (undefined extends T[K] ? U | null : U) : never
        }
      : T extends undefined
        ? null
        : T
