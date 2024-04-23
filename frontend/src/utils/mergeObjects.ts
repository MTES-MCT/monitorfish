/**
 * Merge objects with a key to array structure
 * Example: {
 *   {
 *     '2018-05-11': [],
 *     '2018-05-16': []
 *   }
 * @param {Object} objectOne - First object
 * @param {Object} objectTwo - Second object
 * @return {Object} The merged object
 */
export function mergeObjects(objectOne, objectTwo) {
  const mergedObject = {}

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(objectOne)) {
    if (!mergedObject[key]) {
      mergedObject[key] = []
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const innerKey of objectOne[key]) {
      mergedObject[key].push(innerKey)
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(objectTwo)) {
    if (!mergedObject[key]) {
      mergedObject[key] = []
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const innerKey of objectTwo[key]) {
      mergedObject[key].push(innerKey)
    }
  }

  return mergedObject
}
