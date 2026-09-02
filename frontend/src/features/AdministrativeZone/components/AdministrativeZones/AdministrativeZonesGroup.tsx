import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import { THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

import type { MonitorFishMap } from '@features/Map/Map.types'

type AdministrativeZonesGroupType = {
  group: MonitorFishMap.CodeAndName
  zones: MonitorFishMap.AdminShowableLayer[]
}

export function AdministrativeZonesGroup({ group, zones }: AdministrativeZonesGroupType) {
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Row>
      <Zone $isOpen={isOpen}>
        <TransparentButton onClick={() => setIsOpen(!isOpen)} title={group.name}>
          <Text>{group.name}</Text>
        </TransparentButton>
        <Chevron isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </Zone>
      <List $isOpen={isOpen} $length={zones.length} title={group.name.replace(/\s/g, '-')}>
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
            zone={zone}
          />
        ))}
      </List>
    </Row>
  )
}

const Row = styled.div`
  display: block;
  width: 100%;
`

const Text = styled.span`
  display: inline-block;
  flex: content;
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  padding-left: 20px;
  padding-bottom: 5px;
  padding-top: 8px;
  text-overflow: ellipsis;
  width: 100%;
`

const Zone = styled.span<{
  $isOpen: boolean
}>`
  display: flex;
  padding-bottom: 2px;
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  ${p => (!p.$isOpen ? null : `border-bottom: 1px solid ${THEME.color.lightGray};`)}
  &:hover {
    background: ${THEME.color.blueGray25};
  }
`

const List = styled.div<{
  $isOpen: boolean
  $length: number
}>`
  height: ${p => (p.$isOpen && p.$length ? p.$length * 37 + 10 : 0)}px;
  overflow: hidden;
  transition: 0.2s all;
`

const Chevron = styled(ChevronIconButton)`
  svg {
    color: ${p => p.theme.color.charcoal};
  }
`
