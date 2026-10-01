import { Banner, type BannerProps } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'
import type { BannerStackItemProps } from 'types'

type ItemProps = Readonly<{
  bannerProps: BannerStackItemProps
  bannerStackId: number
  onCloseOrAutoclose: (bannerStackKey: number) => Promisable<void>
}>
export function Item({ bannerProps, bannerStackId, onCloseOrAutoclose }: ItemProps) {
  // `Banner` restarts its auto-closing timer whenever these callbacks change,
  // so they must stay stable when other banners are added to or removed from the stack
  const close = useCallback(() => onCloseOrAutoclose(bannerStackId), [bannerStackId, onCloseOrAutoclose])

  const controlledBannerProps: BannerProps = {
    ...bannerProps,
    onAutoClose: close,
    onClose: close,
    top: '0'
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledBanner {...controlledBannerProps} />
  )
}

const StyledBanner = styled(Banner)`
  position: static;
  > div {
    > p {
      font-size: 16px !important;
    }
  }
`
