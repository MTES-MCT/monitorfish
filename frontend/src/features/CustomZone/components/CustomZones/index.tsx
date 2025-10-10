import { StyledTransparentButton, Title } from '@features/LayersSidebar/components/style'
import { LayerType } from '@features/Map/constants'
import { layerActions } from '@features/Map/layer.slice'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { CustomZone } from './CustomZone'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { COLORS } from '../../../../constants/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIconButton } from '../../../commonStyles/icons/ChevronIconButton'
import { initDragAndDrop } from '../../useCases/initDragAndDrop'
import { initLayer } from '../../useCases/initLayer'
import { remove } from '../../useCases/remove'
import { showOrHide } from '../../useCases/showOrHide'

export type CustomZonesProps = Readonly<{
  hideLayersListWhenSearching?: boolean
}>

export function CustomZones({ hideLayersListWhenSearching = false }: CustomZonesProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const [isOpened, setIsOpened] = useState(false)
  const { isOpened: isListOpened, isRendered } = useDisplayMapBox(isOpened)

  const zones = useMainAppSelector(state => state.customZone.zones)
  const zoneList = useMemo(() => Object.values(zones), [zones])
  const zonesLength = useMemo(() => zoneList.length, [zoneList])

  useEffect(() => {
    dispatch(initDragAndDrop(isSuperUser))
    dispatch(initLayer())
  }, [dispatch, isSuperUser])

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
    if (isOpened) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(LayerType.CUSTOM))
    }
  }

  return (
    <>
      <Title $isOpen={isListOpened} data-cy="custom-zones-toggle">
        <StyledTransparentButton onClick={onSectionTitleClicked}>Mes zones importées</StyledTransparentButton>
        <ChevronIconButton isOpen={isListOpened} onClick={onSectionTitleClicked} />
      </Title>
      {isRendered && (
        <List $isOpened={isListOpened} $zonesLength={zonesLength}>
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
            Glissez et déposez sur la carte un fichier de tracé pour l’ajouter à vos zones importées (formats autorisés
            : .kml, .gpx)
          </HowTo>
        </List>
      )}
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
