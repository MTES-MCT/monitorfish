import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

export const Zone = styled.div`
  margin: 10px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

export const Title = styled.div`
  color: ${COLORS.slateGray};
  background: ${COLORS.lightGray};
  padding: 8.5px 10px 8px 20px;
  font-size: 0.8rem;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
  font-size: 13px;
  font-weight: 500;
`

export const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

export const StrongText = styled.span`
  color: ${COLORS.gunMetal};
  margin-left: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: 200px;
  display: inline-block;
  vertical-align: top;
  font-weight: 500;
`
