import type { SideWindowMenuKey } from './constants'

export namespace SideWindow {
  /**
   * @example
   * ```ts
   * // Edit a new mission
   * dispatch(sideWindowActions.openPath({
   *   isLoading: true,
   *   menu: SideWindowMenuKey.MY_ENTITY_FORM,
   *   id: 'new',
   * })),
   *
   * // Edit an existing mission
   * dispatch(sideWindowActions.openPath({
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
