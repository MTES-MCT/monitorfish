export const getLocalStorageState = (defaultValue, key) => {
  const stickyValue = window.localStorage.getItem(key)

  return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
}
