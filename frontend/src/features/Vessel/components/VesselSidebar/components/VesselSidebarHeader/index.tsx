import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { setIsFocusedOnVesselSearch } from '@features/Vessel/slice'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { VesselName } from './VesselName'
import { expandRightMenu } from '../../../../../../domain/shared_slices/Global'
import { MapComponent } from '../../../../../commonStyles/MapComponent'
import { VesselSearch } from '../../../../../VesselSearch'

import type { Vessel } from '@features/Vessel/Vessel.types'

export function VesselSidebarHeader() {
  const dispatch = useMainAppDispatch()

  const { isFocusedOnVesselSearch, selectedVessel, selectedVesselIdentity, vesselSidebarIsOpen } = useMainAppSelector(
    state => state.vessel
  )

  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity
  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen

  const handleVesselChange = useCallback(
    (vesselIdentity: Vessel.VesselIdentity | undefined) => {
      if (!vesselIdentity) {
        return
      }

      if (!vesselsAreEquals(vesselIdentity, selectedVesselIdentity)) {
        dispatch(showVessel(vesselIdentity, true))
      }
      dispatch(setIsFocusedOnVesselSearch(false))
    },
    [dispatch, selectedVesselIdentity]
  )

  return (
    <>
      <VesselNameOrInput
        $isRightMenuShrinked={isRightMenuShrinked}
        data-cy="vessel-name"
        isHidden={previewFilteredVesselsMode}
      >
        {isVesselNameShown && (
          <VesselName focusOnVesselSearchInput={() => dispatch(setIsFocusedOnVesselSearch(true))} />
        )}
        {!isVesselNameShown && (
          <VesselSearch
            extendedWidth={500}
            isExtended={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            isLastSearchedVesselsShowed={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            onChange={handleVesselChange}
            onClickOutsideOrEscape={() => {
              dispatch(setIsFocusedOnVesselSearch(false))
            }}
            onInputClick={() => {
              dispatch(setIsFocusedOnVesselSearch(true))
            }}
          />
        )}
      </VesselNameOrInput>
      <MapToolButton
        Icon={Icon.Search}
        isActive={!!selectedVessel}
        onClick={() => dispatch(setIsFocusedOnVesselSearch(true))}
        onMouseEnter={() => dispatch(expandRightMenu())}
        style={{ top: 10 }}
        title="Rechercher un navire"
      />
    </>
  )
}

const VesselNameOrInput = styled(MapComponent)<{
  $isRightMenuShrinked: boolean
}>`
  position: absolute;
  display: inline-block;
  top: 10px;
  right: ${p => (p.$isRightMenuShrinked ? 10 : 55)}px;
  z-index: 1000;
  color: ${p => p.theme.color.gainsboro};
  text-decoration: none;
  border: none;
  background-color: none;
  border-radius: 2px;
  padding: 0 0 0 0;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s;

  &:hover,
  &:focus {
    background-color: none;
  }
`
