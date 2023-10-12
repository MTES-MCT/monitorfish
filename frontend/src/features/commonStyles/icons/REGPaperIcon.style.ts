import styled, { css } from 'styled-components'

import REGPaperSVG from '../../icons/reg_paper.svg?react'
import REGPaperDarkSVG from '../../icons/reg_paper_dark.svg?react'

const baseREGPaperIcon = css`
  width: 20px;
  flex-shrink: 0;
  height: 20px;
  align-self: center;
  margin-right: 7px;
`
export const PaperIcon = styled(REGPaperSVG)`
  ${baseREGPaperIcon}
`

export const PaperDarkIcon = styled(REGPaperDarkSVG)`
  ${baseREGPaperIcon}
`
