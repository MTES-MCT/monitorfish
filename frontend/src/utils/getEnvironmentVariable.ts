/**
 * Get an environment variable and normalize its value.
 */
export function getEnvironmentVariable(key: string): boolean | string | undefined {
  const value = import.meta.env[key] || (window as any).PUBLIC_ENV[key]

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}
