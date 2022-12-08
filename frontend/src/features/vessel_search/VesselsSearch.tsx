import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { getOnlyVesselIdentityProperties, vesselsAreEquals } from '../../domain/entities/vessel/vessel'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import { setIsFocusedOnVesselSearch } from '../../domain/shared_slices/Vessel'
import { getVesselVoyage } from '../../domain/use_cases/vessel/getVesselVoyage'
import { searchVessels as searchVesselsAction } from '../../domain/use_cases/vessel/searchVessels'
import { showVessel } from '../../domain/use_cases/vessel/showVessel'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../hooks/useClickOutsideWhenOpened'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import { VESSEL_SEARCH_OPTIONS } from './constants'
import { addVesselIdentifierToVesselIdentity, removeDuplicatedFoundVessels } from './utils'
import { VesselName } from './VesselName'
import { VesselSearchResult } from './VesselSearchResult'

import type { VesselIdentity } from '../../domain/entities/vessel/types'

export function VesselsSearch() {
  const dispatch = useAppDispatch()

  const { isFocusedOnVesselSearch, selectedVessel, selectedVesselIdentity, vessels, vesselSidebarIsOpen } =
    useAppSelector(state => state.vessel)

  const { healthcheckTextWarning, previewFilteredVesselsMode, rightMenuIsOpen } = useAppSelector(state => state.global)

  const wrapperRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [foundVessels, setFoundVessels] = useState<VesselIdentity[]>([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)
  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isFocusedOnVesselSearch)
  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity
  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen

  const focusOnInputAndShowLastSearchedVessels = useCallback(
    isFocused => {
      dispatch(setIsFocusedOnVesselSearch(isFocused))
      setShowLastSearchedVessels(isFocused)

      if (!isFocused) {
        setSearchQuery('')
      }
    },
    [dispatch]
  )

  useEffect(() => {
    if (clickedOutsideComponent || escapeFromKeyboard) {
      focusOnInputAndShowLastSearchedVessels(false)
    }
  }, [clickedOutsideComponent, escapeFromKeyboard, focusOnInputAndShowLastSearchedVessels])

  const selectVessel = useCallback(
    vesselIdentity => {
      if (!vesselsAreEquals(vesselIdentity, selectedVesselIdentity)) {
        dispatch(showVessel(vesselIdentity, true, false) as any)
        dispatch(getVesselVoyage(vesselIdentity, undefined, false) as any)
      }

      focusOnInputAndShowLastSearchedVessels(false)
      setFoundVessels([])
    },
    [dispatch, focusOnInputAndShowLastSearchedVessels, selectedVesselIdentity]
  )

  const fuse = useMemo(() => new Fuse(vessels, VESSEL_SEARCH_OPTIONS), [vessels])

  useEffect(() => {
    if (!searchQuery || searchQuery.length <= 1) {
      setFoundVessels([])

      return
    }

    async function searchVessels(_searchQuery) {
      const vesselsFromMap = fuse
        .search(_searchQuery)
        .map(result => getOnlyVesselIdentityProperties(result.item.vesselProperties))

      const nextFoundVesselsFromAPI: VesselIdentity[] = await dispatch(
        searchVesselsAction(_searchQuery.toUpperCase()) as any
      )

      const nextFoundVessels = removeDuplicatedFoundVessels(nextFoundVesselsFromAPI, vesselsFromMap).map(identity =>
        addVesselIdentifierToVesselIdentity(identity)
      )

      setFoundVessels(nextFoundVessels)
    }

    searchVessels(searchQuery)
  }, [dispatch, searchQuery, fuse])

  return (
    <>
      <VesselNameOrInput
        ref={wrapperRef}
        data-cy="vessel-name"
        healthcheckTextWarning={!!healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isRightMenuShrinked={isRightMenuShrinked}
      >
        <Flex>
          {isVesselNameShown ? (
            <VesselName focusOnVesselSearchInput={focusOnInputAndShowLastSearchedVessels} />
          ) : (
            <Input
              ref={input => (selectedVesselIdentity ? input && input.focus() : null)}
              data-cy="vessel-search-input"
              isExtended={isFocusedOnVesselSearch || vesselSidebarIsOpen}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={() => focusOnInputAndShowLastSearchedVessels(true)}
              placeholder="Rechercher un navire..."
              type="text"
              value={searchQuery}
            />
          )}
        </Flex>
        <VesselSearchResult
          foundVessels={foundVessels}
          searchQuery={searchQuery}
          selectVessel={selectVessel}
          showLastSearchedVessels={showLastSearchedVessels}
        />
      </VesselNameOrInput>
      <SearchButton
        healthcheckTextWarning={!!healthcheckTextWarning}
        isHidden={!!previewFilteredVesselsMode}
        isOpen={!!selectedVessel}
        isShrinked={isRightMenuShrinked}
        onClick={() => focusOnInputAndShowLastSearchedVessels(true)}
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

const Flex = styled.div`
  display: flex;
`

const Input = styled.input<{
  isExtended: boolean
}>`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: ${p => (p.isExtended ? 500 : 320)}px;
  padding: 0 5px 0 10px;
  flex: 3;
  transition: all 0.7s;

  :hover,
  :focus {
    border: none;
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
