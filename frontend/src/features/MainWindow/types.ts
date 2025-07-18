import type { BannerProps } from '@mtes-mct/monitor-ui'

export type BannerStackItem = {
  id: number
  props: BannerStackItemProps
}
export type BannerStackItemProps = Omit<BannerProps, 'children' | 'onAutoClose' | 'onClose' | 'top'> & {
  children: string
}
