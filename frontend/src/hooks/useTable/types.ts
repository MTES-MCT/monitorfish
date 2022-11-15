import type { CollectionItem, Native } from '../../types'
import type Fuse from 'fuse.js'

export type TableColumn<T extends Record<string, any> = Record<string, any>> = {
  /** Fixed width expressed in root ephemeral unit (rem) */
  fixedWidth?: number
  isSortable?: boolean
  key: string
  label: string
  /**
   * Transform the column value into a custom value used as the rendered label.
   *
   * @remark
   * Take precedence over `transform` property.
   */
  labelTransform?: (dataItem: T) => Native
  /** Relative width expressed as a percentage ratio (between 0 and 1) */
  relativeWidth?: number
  /**
   * Transform the column value into a custom value used to search into this key values.
   *
   * @remark
   * Take precedence over `transform` property.
   */
  searchTransform?: (dataItem: T) => string
  /**
   * Transform the column value into a custom value used to sort this key values.
   *
   * @remark
   * Take precedence over `transform` property.
   */
  sortingTransform?: (dataItem: T) => Native
  /** Transform the column value into a custom value used to label, search and sort this key values */
  transform?: (dataItem: T) => Native
}

export type TableOptions<T extends CollectionItem> = {
  columns: TableColumn<T>[]
  defaultSortedKey?: string
  isCheckable?: boolean
  isDefaultSortingDesc?: boolean
  searchFuseOptions?: Fuse.IFuseOptions<AugmentedDataItem<T>>
  searchQuery?: string
  searchableKeys?: string[]
}

export type AugmentedDataItem<T extends CollectionItem> = {
  id: number | string
  isChecked: boolean
  item: T
  labelled: Partial<T>
  searchable: Partial<T>
  sortable: Partial<T>
}

export type AugmentedDataItemBase<T extends CollectionItem> = Pick<AugmentedDataItem<T>, 'id' | 'item'>
