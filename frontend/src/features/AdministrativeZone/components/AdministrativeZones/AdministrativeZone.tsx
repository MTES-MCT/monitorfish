import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'

import type { ShowableLayer } from '../../../../domain/entities/layers/types'

type AdministrativeZoneType = {
  isFirst?: boolean
  isGrouped?: boolean
  isShown: boolean
  showOrHideZone: (isShown: boolean) => void
  zone: ShowableLayer
}
export function AdministrativeZone({ isFirst, isGrouped, isShown, showOrHideZone, zone }: AdministrativeZoneType) {
  return (
    <Row
      $isFirst={isFirst}
      $isGrouped={isGrouped}
      data-cy="administrative-layer-toggle"
      onClick={() => showOrHideZone(isShown)}
    >
      <LayerName title={zone.name}>{zone.name}</LayerName>
      <ShowOrHideWrapper>{isShown ? <ShowIcon /> : <HideIcon />}</ShowOrHideWrapper>
    </Row>
  )
}

const ShowOrHideWrapper = styled.div`
  float: right;
  padding-right: 12px;
  padding-top: 6px;
`

const LayerName = styled.span`
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-top: 5px;
`

const Row = styled.span<{
  $isFirst: boolean | undefined
  $isGrouped: boolean | undefined
}>`
  margin-top: ${p => (p.$isFirst ? 5 : 0)}px;
  padding: 4px 0 4px 20px;
  padding-left: ${p => (p.$isGrouped ? '38px' : '20px')};
  line-height: 20px;
  display: block;
  user-select: none;
  font-weight: 500;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  &:hover {
    background: ${THEME.color.blueGray25};
  }
`
