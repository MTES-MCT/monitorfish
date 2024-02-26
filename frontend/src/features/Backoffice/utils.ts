import { SelectPickerObject } from '@features/Backoffice/types'

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
    const array = [...list].map(e => {
      const i = item(e)

      return i
    })

    return array
  }

  return []
}
