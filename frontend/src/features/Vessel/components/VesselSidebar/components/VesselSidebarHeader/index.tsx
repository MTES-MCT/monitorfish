import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { VesselSearchWithMapVessels } from '@features/Vessel/components/VesselSearch/VesselSearchWithMapVessels'
import { setIsFocusedOnVesselSearch } from '@features/Vessel/slice'
import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { showAISVessel } from '@features/Vessel/useCases/showAISVessel'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { VesselName } from './VesselName'
import { expandRightMenu } from '../../../../../../domain/shared_slices/Global'
import { MapComponent } from '../../../../../commonStyles/MapComponent'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function VesselSidebarHeader() {
  const dispatch = useMainAppDispatch()

  const isFocusedOnVesselSearch = useMainAppSelector(state => state.vessel.isFocusedOnVesselSearch)
  const listFilterValues = useMainAppSelector(state => state.vessel.listFilterValues)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const areAISVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areAISVesselsDisplayed)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const vesselLocation =
    listFilterValues.vesselsLocation?.length === 1 ? listFilterValues.vesselsLocation[0] : undefined
  const { data: aisVessels } = useMainAppSelector(vesselApi.endpoints.getAISVessels.select(vesselLocation))

  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity

  const handleClickOutsideOrEscape = useCallback(() => {
    dispatch(setIsFocusedOnVesselSearch(false))
  }, [dispatch])

  const handleInputClick = useCallback(() => {
    dispatch(setIsFocusedOnVesselSearch(true))
  }, [dispatch])

  const handleVesselChange = useCallback(
    (vessel: Vessel.VesselIdentity | AISVessel.AISVessel | undefined, isAIS?: boolean) => {
      if (!vessel) {
        return
      }

      if (isAIS) {
        dispatch(showAISVessel(vessel as AISVessel.AISVessel))

        return
      }

      const vesselIdentity = vessel as Vessel.VesselIdentity
      if (!vesselsAreEquals(vesselIdentity, selectedVesselIdentity)) {
        dispatch(showVessel(vesselIdentity, true))
      }
      dispatch(setIsFocusedOnVesselSearch(false))
    },
    [dispatch, selectedVesselIdentity]
  )

  return (
    <>
      <VesselNameOrInput $isRightMenuOpen={rightMenuIsOpen} data-cy="vessel-name" isHidden={previewFilteredVesselsMode}>
        {isVesselNameShown && <VesselName focusOnVesselSearchInput={handleInputClick} />}
        {!isVesselNameShown && (
          <VesselSearchWithMapVessels
            aisVessels={areAISVesselsDisplayed ? aisVessels : undefined}
            autoFocus={isFocusedOnVesselSearch}
            extendedWidth={500}
            isExtended={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            onBlur={handleClickOutsideOrEscape}
            onChange={handleVesselChange}
            onClick={handleInputClick}
            shouldCloseOnClickOutside
            shouldResetInputOnBlur
            withLastSearchResults={isFocusedOnVesselSearch || vesselSidebarIsOpen}
          />
        )}
      </VesselNameOrInput>
      <SearchIconWrapper onMouseDown={e => e.stopPropagation()}>
        <MapToolButton
          Icon={Icon.Search}
          isActive={!!selectedVessel}
          onClick={handleInputClick}
          onMouseEnter={() => dispatch(expandRightMenu())}
          title="Rechercher un navire"
        />
      </SearchIconWrapper>
    </>
  )
}

const SearchIconWrapper = styled.div`
  display: contents;
`

const VesselNameOrInput = styled(MapComponent)<{
  $isRightMenuOpen: boolean
}>`
  display: flex;
  flex: 0 0 auto;
  margin-left: 12px;
  position: relative;
  color: ${p => p.theme.color.gainsboro};
  text-decoration: none;
  border: none;
  background-color: unset;
  border-radius: 2px;
  padding: 0;
  transition: all 0.3s;
  margin-right: ${p => (p.$isRightMenuOpen ? 11 : 1)}px;
  z-index: 2;

  &:hover,
  &:focus {
    background-color: unset;
  }
`
