import { Banner, type BannerProps } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'
import type { BannerStackItemProps } from 'types'

type ItemProps = {
  bannerProps: BannerStackItemProps
  bannerStackRank: number
  onCloseOrAutoclose: (bannerStackKey: number) => Promisable<void>
}
export function Item({ bannerProps, bannerStackRank, onCloseOrAutoclose }: ItemProps) {
  const controlledBannerProps: BannerProps = {
    ...bannerProps,
    onAutoClose: () => onCloseOrAutoclose(bannerStackRank),
    onClose: () => onCloseOrAutoclose(bannerStackRank),
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
