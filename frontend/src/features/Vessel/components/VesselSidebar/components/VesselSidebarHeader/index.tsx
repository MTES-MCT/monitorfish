import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
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

  const handleClickOutsideOrEscape = useCallback(() => {
    dispatch(setIsFocusedOnVesselSearch(false))
  }, [dispatch])

  const handleInputClick = useCallback(() => {
    dispatch(setIsFocusedOnVesselSearch(true))
  }, [dispatch])

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
      <VesselNameOrInput $isRightMenuOpen={rightMenuIsOpen} data-cy="vessel-name" isHidden={previewFilteredVesselsMode}>
        {isVesselNameShown && <VesselName focusOnVesselSearchInput={handleInputClick} />}
        {!isVesselNameShown && (
          <VesselSearch
            extendedWidth={500}
            isExtended={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            isLastSearchedVesselsShowed={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            onChange={handleVesselChange}
            onClickOutsideOrEscape={handleClickOutsideOrEscape}
            onInputClick={handleInputClick}
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
