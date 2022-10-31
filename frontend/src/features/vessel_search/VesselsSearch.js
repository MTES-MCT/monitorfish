import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import showVessel from '../../domain/use_cases/vessel/showVessel'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import searchVessels from '../../domain/use_cases/vessel/searchVessels'
import { vesselsAreEquals } from '../../domain/entities/vessel'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import VesselSearchResult from './VesselSearchResult'
import VesselName from './VesselName'
import { useEscapeFromKeyboard } from '../../hooks/useEscapeFromKeyboard'
import { findMatchingFeature, removeDuplicatedFoundVessels } from './vesselsSearchUtils'
import getVesselVoyage from '../../domain/use_cases/vessel/getVesselVoyage'
import { useClickOutsideWhenOpened } from '../../hooks/useClickOutsideWhenOpened'
import { setFocusOnVesselSearch } from '../../domain/shared_slices/Vessel'

const VesselsSearch = () => {
  const dispatch = useDispatch()

  const {
    vessels,
    vesselSidebarIsOpen,
    selectedVesselIdentity,
    isFocusedOnVesselSearch,
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    rightMenuIsOpen,
    healthcheckTextWarning,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const wrapperRef = useRef(null)
  const [searchText, setSearchText] = useState('')
  const [foundVesselsOnMap, setFoundVesselsOnMap] = useState([])
  const [foundVesselsFromAPI, setFoundVesselsFromAPI] = useState([])
  const [showLastSearchedVessels, setShowLastSearchedVessels] = useState(false)
  const escapeFromKeyboard = useEscapeFromKeyboard()
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isFocusedOnVesselSearch)
  const isVesselNameShown = !isFocusedOnVesselSearch && selectedVesselIdentity
  const isRightMenuShrinked = vesselSidebarIsOpen && !rightMenuIsOpen

  useEffect(() => {
    if (clickedOutsideComponent || escapeFromKeyboard) {
      focusOnVesselSearchInput(false)
    }
  }, [clickedOutsideComponent, escapeFromKeyboard])

  const focusOnVesselSearchInput = useCallback(isFocused => {
    dispatch(setFocusOnVesselSearch(isFocused))

    if (!isFocused) {
      setSearchText('')
      setFoundVesselsFromAPI([])
      setFoundVesselsOnMap([])
      setShowLastSearchedVessels(false)
      return
    }

    if (isFocused && !searchText?.length) {
      setShowLastSearchedVessels(true)
    }
  }, [searchText])

  const selectVessel = useCallback(vessel => {
    if (!vesselsAreEquals(vessel, selectedVesselIdentity)) {
      dispatch(showVessel(vessel, true, false))
      dispatch(getVesselVoyage(vessel, null, false))
    }

    focusOnVesselSearchInput(false)
  }, [selectedVesselIdentity])

  useEffect(() => {
    if (searchText.length > 1) {
      setShowLastSearchedVessels(false)
      const foundVesselsOnMap = getFoundVesselsOnMap(vessels, searchText)
      setFoundVesselsOnMap(foundVesselsOnMap)

      dispatch(searchVessels(searchText.toUpperCase())).then(foundVesselsFromAPI => {
        const distinctFoundVessels = removeDuplicatedFoundVessels(foundVesselsFromAPI, foundVesselsOnMap)
        setFoundVesselsFromAPI(distinctFoundVessels)
      })
    } else {
      setFoundVesselsOnMap([])
      setFoundVesselsFromAPI([])
    }
  }, [searchText])

  return (
    <>
      <VesselNameOrInput
        ref={wrapperRef}
        data-cy={'vessel-name'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsShrinked={isRightMenuShrinked}
      >
        <Flex>
          {
            isVesselNameShown
              ? <VesselName
                focusOnVesselSearchInput={focusOnVesselSearchInput}
              />
              : <Input
                data-cy={'vessel-search-input'}
                ref={input => selectedVesselIdentity ? input && input.focus() : null}
                type="text"
                onClick={() => focusOnVesselSearchInput(true)}
                value={searchText}
                placeholder={'Rechercher un navire...'}
                onChange={e => setSearchText(e.target.value)}
                isExtended={isFocusedOnVesselSearch || vesselSidebarIsOpen}
              />
          }
        </Flex>
        <VesselSearchResult
          showLastSearchedVessels={showLastSearchedVessels}
          foundVesselsOnMap={foundVesselsOnMap}
          foundVesselsFromAPI={foundVesselsFromAPI}
          selectVessel={selectVessel}
          searchText={searchText}
        />
      </VesselNameOrInput>
      <SearchButton
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        title={'Rechercher un navire'}
        onMouseEnter={() => dispatch(expandRightMenu())}
        onClick={() => focusOnVesselSearchInput(true)}
        isShrinked={isRightMenuShrinked}
        isOpen={selectedVessel}
      >
        <SearchIcon
          $isShrinked={isRightMenuShrinked}
        />
      </SearchButton>
    </>
  )
}

function getFoundVesselsOnMap (vessels, searchText) {
  const foundFeatures = []
  vessels.forEach(feature => {
    if (findMatchingFeature(feature, searchText)) {
      foundFeatures.push(feature)
    }
  })

  return foundFeatures.slice(0, 30)
}

const VesselNameOrInput = styled(MapComponentStyle)`
  position: absolute;
  display: inline-block;
  top: 10px;
  right: ${props => props.rightMenuIsShrinked ? 10 : 55}px;
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

  :hover, :focus {
    background-color: none;
  }
`

const Flex = styled.div`
  display: flex;
`

const Input = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: ${props => props.isExtended ? 500 : 320}px;
  padding: 0 5px 0 10px;
  flex: 3;
  transition: all 0.7s;

  :hover, :focus {
    border: none;
  }
`

const SearchButton = styled(MapButtonStyle)`
  width: 40px;
  height: 40px;
  right: 10px;
  top: 10px;
  z-index: 99;
  cursor: pointer;
  border-radius: 2px;
  position: absolute;
  width: ${props => props.isShrinked ? 5 : 40}px;
  border-radius: ${props => props.isShrinked ? 1 : 2}px;
  right: ${props => props.isShrinked ? 0 : 10}px;
  background: ${props => props.isOpen ? props.theme.color.blueGray[100] : props.theme.color.charcoal};
  transition: all 0.3s;

  :hover, :focus {
      background: ${props => props.isOpen ? props.theme.color.blueGray[100] : props.theme.color.charcoal};
  }
`

const SearchIcon = styled(SearchIconSVG)`
  width: 24px;
  height: 24x;
  margin-top: 4px;
  opacity: ${props => props.$isShrinked ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselsSearch
