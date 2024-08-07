import { Banner } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const CardBanner = styled(Banner)`
  box-shadow: inset 0 3px 6px ${p => p.theme.color.lightGray};
  padding: 0;

  > div > p {
    font-size: 16px;
    font-weight: 500;
    padding-top: 3px;
  }

  > .banner-button {
    position: relative;

    > button {
      position: absolute;
      right: 32px;
      top: -7.5px;
    }
  }
`
