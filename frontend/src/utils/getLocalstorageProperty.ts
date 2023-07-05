/**
 * Get property of object stored in localstorage
 */
export const getLocalstorageProperty = (defaultValue, key, property) => {
  const stickyValue = window.localStorage.getItem(key)
  if (stickyValue !== null) {
    const object = JSON.parse(stickyValue)

    if (object[property] !== undefined) {
      return object[property]
    }
  }

  return defaultValue
}
