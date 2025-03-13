import { SideWindowMenuKey } from '@features/SideWindow/constants'

import type { BannerProps } from '@mtes-mct/monitor-ui'

export namespace SideWindow {
  export type BannerStackItem = {
    id: number
    props: BannerStackItemProps
  }
  export type BannerStackItemProps = Omit<BannerProps, 'chilren' | 'onAutoClose' | 'onClose' | 'top'> & {
    children: string
  }

  /**
   * @example
   * ```ts
   * // Open a non-form menu
   * dispatch(openSideWindowPath({
   *   menu: SideWindowMenuKey.MY_ENTITY_LIST,
   * })),
   *
   * // Open a new entity form
   * dispatch(openSideWindowPath({
   *   menu: SideWindowMenuKey.MY_ENTITY_FORM,
   *   id: 'new',
   * })),
   *
   * // Edit an existing entity
   * dispatch(openSideWindowPath({
   *   isLoading: true,
   *   menu: SideWindowMenuKey.MY_ENTITY_FORM,
   *   id: 123
   * })),
   * ```
   */
  export type Path = {
    isLoading?: boolean
    menu: SideWindowMenuKey
    subMenu?: string | undefined
  } & (
    | {}
    | {
        id: 'new'
      }
    | {
        id: number
      }
  )

  export type FullPath = {
    isLoading?: boolean
    menu: SideWindowMenuKey
    subMenu?: string | undefined
  } & (
    | {
        id: undefined
        isNew: false
        key: undefined
      }
    | {
        id: undefined
        isNew: true
        key: string
      }
    | {
        id: number
        isNew: false
        key: undefined
      }
  )
}
