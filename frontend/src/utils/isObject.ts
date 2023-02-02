export function isObject<T extends { [key: string]: any }>(value: any): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor.name === 'Object'
}
