import { useCallback } from 'react'
import styled from 'styled-components'

import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { expandRightMenu } from '../../../domain/shared_slices/Global'
import { setIsFocusedOnVesselSearch } from '../../../domain/shared_slices/Vessel'
import { getVesselVoyage } from '../../../domain/use_cases/vessel/getVesselVoyage'
import { showVessel } from '../../../domain/use_cases/vessel/showVessel'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import { ReactComponent as SearchIconSVG } from '../../icons/Loupe.svg'
import { VesselSearch } from '../../VesselSearch'
import { VesselName } from './VesselName'

export function VesselSidebarHeader() {
  const dispatch = useAppDispatch()

  const { isFocusedOnVesselSearch, selectedVessel, selectedVesselIdentity, vesselSidebarIsOpen } = useAppSelector(
    state => state.vessel
  )

  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useAppSelector(state => state.global)

  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity
  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen

  const onSelectVessel = useCallback(
    vesselIdentity => {
      if (!vesselsAreEquals(vesselIdentity, selectedVesselIdentity)) {
        dispatch(showVessel(vesselIdentity, true, false) as any)
        dispatch(getVesselVoyage(vesselIdentity, undefined, false) as any)
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
            isFocused={isFocusedOnVesselSearch || vesselSidebarIsOpen}
            onClickOutsideOrEscape={() => dispatch(setIsFocusedOnVesselSearch(false))}
            onInputClick={() => dispatch(setIsFocusedOnVesselSearch(true))}
            onSelectVessel={onSelectVessel}
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
  background: ${p => (p.isOpen ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${p => (p.isOpen ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
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
