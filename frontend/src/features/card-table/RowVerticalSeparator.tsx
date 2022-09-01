import FlexboxGrid from 'rsuite/FlexboxGrid'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export const RowVerticalSeparator = styled(FlexboxGrid.Item)`
  height: 43px;
  width: 2px;
  border-left: 1px solid ${COLORS.lightGray};
  margin-top: -14px;
  margin-right: 5px;
`
