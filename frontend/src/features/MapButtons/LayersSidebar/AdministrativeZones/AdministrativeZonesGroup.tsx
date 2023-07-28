import { useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { COLORS } from '../../../../constants/constants'
import { CodeAndName } from '../../../../domain/entities/types'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { theme } from '../../../../ui/theme'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'

import type { ShowableLayer } from '../../../../domain/entities/layers/types'

type AdministrativeZonesGroupType = {
  group: CodeAndName
  showOrHideZone: (zone: ShowableLayer) => (isShown: boolean) => void
  zones: ShowableLayer[]
}
export function AdministrativeZonesGroup({ group, showOrHideZone, zones }: AdministrativeZonesGroupType) {
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Row>
      <Zone isOpen={isOpen}>
        <Text onClick={() => setIsOpen(!isOpen)} title={group.name}>
          {group.name}
        </Text>
        <Chevron $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </Zone>
      <List isOpen={isOpen} length={zones.length} title={group.name.replace(/\s/g, '-')}>
        {zones.map((zone, index) => (
          <AdministrativeZone
            key={zone.code}
            isFirst={index === 0}
            isGrouped
            isShown={showedLayers.some(showedZone => {
              if (showedZone.zone) {
                return showedZone.type === zone.group?.code && showedZone.zone === zone.code
              }

              return showedZone.type === zone.code
            })}
            showOrHideZone={showOrHideZone(zone)}
            zone={zone}
          />
        ))}
      </List>
    </Row>
  )
}

const Row = styled.div`
  width: 100%;
  display: block;
`

const Text = styled.span`
  padding-left: 20px;
  width: 100%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-bottom: 5px;
  padding-top: 8px;
  font-weight: 500;
  line-height: 20px;
  flex: content;
`

const Zone = styled.span<{
  isOpen: boolean
}>`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;
  display: flex;
  user-select: none;
  padding-bottom: 2px;
  ${p => (!p.isOpen ? null : `border-bottom: 1px solid ${COLORS.lightGray};`)}

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`

const List = styled.div<{
  isOpen: boolean
  length: number
}>`
  height: ${p => (p.isOpen && p.length ? p.length * 34 + 10 : 0)}px;
  overflow: hidden;
  transition: 0.2s all;
`

const Chevron = styled(ChevronIcon)`
  margin-top: 8px;
`
