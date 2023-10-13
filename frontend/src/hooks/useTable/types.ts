import type { CollectionItem, Native } from '../../types'
import type Fuse from 'fuse.js'

export type TableColumn<T extends Record<string, any> = Record<string, any>> = {
  fallbackKey?: string | undefined
  /** Fixed width expressed in root ephemeral unit (rem) */
  fixedWidth?: number
  isSortable?: boolean
  key: string
  label?: string
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
  searchFuseOptions?: Fuse.IFuseOptions<TableItem<T>>
  searchQuery?: string
  searchableKeys?: string[]
}

export type TableItem<T extends CollectionItem> = T & {
  $isChecked: boolean
  $labelled: Record<string, string>
  $searchable: Record<string, any>
  $sortable: Record<string, any>
}

export type FilterFunction<T extends CollectionItem> = (collection: T[]) => T[]
