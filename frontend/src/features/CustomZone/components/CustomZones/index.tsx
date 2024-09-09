import { logSoftError } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { CustomZone } from './CustomZone'
import { COLORS } from '../../../../constants/constants'
import { LayerType } from '../../../../domain/entities/layers/constants'
import LayerSlice from '../../../../domain/shared_slices/Layer'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { initDragAndDrop } from '../../useCases/initDragAndDrop'
import { initLayer } from '../../useCases/initLayer'
import { remove } from '../../useCases/remove'
import { showOrHide } from '../../useCases/showOrHide'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'

export type CustomZonesProps = {
  hideLayersListWhenSearching?: boolean
  namespace: LayerSliceNamespace
}
export function CustomZones({ hideLayersListWhenSearching = false, namespace }: CustomZonesProps) {
  const { setLayersSideBarOpenedLayerType } = LayerSlice[namespace].actions

  const dispatch = useMainAppDispatch()

  const { layersSidebarOpenedLayerType } = useMainAppSelector(state => state.layer)
  const [isOpened, setIsOpened] = useState(false)

  const zones = useMainAppSelector(state => state.customZone.zones)
  const zoneList = useMemo(() => Object.values(zones), [zones])
  const zonesLength = useMemo(() => zoneList.length, [zoneList])

  useEffect(() => {
    dispatch(initDragAndDrop())
    dispatch(initLayer())
  }, [dispatch])

  useEffect(() => {
    setIsOpened(layersSidebarOpenedLayerType === LayerType.CUSTOM)
  }, [layersSidebarOpenedLayerType, setIsOpened])

  useEffect(() => {
    if (hideLayersListWhenSearching) {
      setIsOpened(false)
    }
  }, [hideLayersListWhenSearching])

  const onToggleShow = useCallback(
    (uuid: string) => {
      dispatch(showOrHide(uuid))
    },
    [dispatch]
  )

  const onRemove = useCallback(
    (uuid: string) => {
      dispatch(remove(uuid))
    },
    [dispatch]
  )

  const onSectionTitleClicked = () => {
    if (!setLayersSideBarOpenedLayerType) {
      logSoftError({
        message: '`setLayersSideBarOpenedLayerType` is undefined.'
      })

      return
    }

    if (isOpened) {
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(setLayersSideBarOpenedLayerType(LayerType.CUSTOM))
    }
  }

  return (
    <>
      <Title $isOpened={isOpened} data-cy="custom-zones-toggle" onClick={onSectionTitleClicked}>
        Mes zones importées <ChevronIcon $isOpen={isOpened} />
      </Title>
      <List $isOpened={isOpened} $zonesLength={zonesLength}>
        {zoneList.map(zone => (
          <CustomZone
            key={zone.uuid}
            isShown={zone.isShown}
            name={zone.name}
            onRemove={onRemove}
            onToggleShowZone={onToggleShow}
            uuid={zone.uuid}
          />
        ))}
        <HowTo>
          Glissez et déposez sur la carte un fichier de tracé pour l’ajouter à vos zones importées (formats autorisés :
          .kml, .gpx)
        </HowTo>
      </List>
    </>
  )
}

const HowTo = styled.li`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  list-style: none;
  padding: 24px 24px;
  text-align: center;
`

const Title = styled.div<{
  $isOpened: boolean
}>`
  height: 30px;
  padding-left: 20px;
  padding-top: 5px;
  font-size: 16px;
  cursor: pointer;
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  text-align: left;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${p => (p.$isOpened ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$isOpened ? '0' : '2px')};

  .Element-IconBox {
    float: right;
    margin-top: 4px;
  }
`

const List = styled.ul<{
  $isOpened: boolean
  $zonesLength: number
}>`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  max-height: 48vh;
  height: ${p => (p.$isOpened ? 36 * p.$zonesLength + 110 : 0)}px;
  background: ${COLORS.white};
  transition: 0.5s all;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`
