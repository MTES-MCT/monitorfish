import type { SelectPickerObject } from './types'

const item = (element: string): SelectPickerObject => ({
  label: element,
  value: element
})

/**
 * @function convert a list of elements to a list of object :
 * [{label: element, value: element, role: groupName}]
 */
export const formatDataForSelectPicker = (list: string[]): SelectPickerObject[] => {
  if (list?.length > 0) {
    return [...list].map(e => item(e))
  }

  return []
}
