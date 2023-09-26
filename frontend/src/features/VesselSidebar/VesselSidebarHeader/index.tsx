import { useCallback } from 'react'
import styled from 'styled-components'

import { VesselName } from './VesselName'
import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { expandRightMenu } from '../../../domain/shared_slices/Global'
import { setIsFocusedOnVesselSearch } from '../../../domain/shared_slices/Vessel'
import { showVessel } from '../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import SearchIconSVG from '../../icons/Loupe.svg?react'
import { VesselSearch } from '../../VesselSearch'

import type { VesselIdentity } from '../../../domain/entities/vessel/types'

export function VesselSidebarHeader() {
  const dispatch = useMainAppDispatch()

  const { isFocusedOnVesselSearch, selectedVessel, selectedVesselIdentity, vesselSidebarIsOpen } = useMainAppSelector(
    state => state.vessel
  )

  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useMainAppSelector(
    state => state.global
  )

  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity
  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen

  const handleVesselChange = useCallback(
    (vesselIdentity: VesselIdentity | undefined) => {
      if (!vesselIdentity) {
        return
      }

      if (!vesselsAreEquals(vesselIdentity, selectedVesselIdentity)) {
        dispatch(showVessel(vesselIdentity, true, true))
      }
      dispatch(setIsFocusedOnVesselSearch(false))
    },
    [dispatch, selectedVesselIdentity]
  )

  return (
    <>
      <VesselNameOrInput
        data-cy="vessel-name"
        healthcheckTextWarning={!!healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isRightMenuShrinked={isRightMenuShrinked}
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
      <SearchButton
        healthcheckTextWarning={!!healthcheckTextWarning}
        isHidden={!!previewFilteredVesselsMode}
        isOpen={!!selectedVessel}
        isShrinked={isRightMenuShrinked}
        onClick={() => dispatch(setIsFocusedOnVesselSearch(true))}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title="Rechercher un navire"
      >
        <SearchIcon $isShrinked={isRightMenuShrinked} />
      </SearchButton>
    </>
  )
}

const VesselNameOrInput = styled(MapComponentStyle)<{
  isRightMenuShrinked: boolean
}>`
  position: absolute;
  display: inline-block;
  top: 10px;
  right: ${p => (p.isRightMenuShrinked ? 10 : 55)}px;
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

  :hover,
  :focus {
    background-color: none;
  }
`

const SearchButton = styled(MapButtonStyle)<{
  isOpen: boolean
  isShrinked: boolean
}>`
  width: 40px;
  height: 40px;
  right: 10px;
  top: 10px;
  z-index: 99;
  cursor: pointer;
  border-radius: 2px;
  position: absolute;
  width: ${p => (p.isShrinked ? 5 : 40)}px;
  border-radius: ${p => (p.isShrinked ? 1 : 2)}px;
  right: ${p => (p.isShrinked ? 0 : 10)}px;
  background: ${p => (p.isOpen ? p.theme.color.blueGray : p.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${p => (p.isOpen ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`

const SearchIcon = styled(SearchIconSVG)<{
  $isShrinked: boolean
}>`
  width: 24px;
  height: 24x;
  margin-top: 4px;
  opacity: ${p => (p.$isShrinked ? '0' : '1')};
  transition: all 0.2s;
`
