import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as SearchIconSVG } from '../icons/Loupe.svg'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import searchVessels from '../../domain/use_cases/searchVessels'
import { vesselsAreEquals } from '../../domain/entities/vessel'
import focusOnVesselSearch, { focusState } from '../../domain/use_cases/focusOnVesselSearch'
import { expandRightMenu } from '../../domain/reducers/Global'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import VesselSearchList from './VesselSearchList'
import SelectedVessel from './SelectedVessel'
import { useClickOutsideComponent } from '../../hooks/useClickOutside'

const VesselsSearchBox = () => {
  const dispatch = useDispatch()

  const {
    vesselsLayerSource,
    vesselSidebarIsOpen,
    isFocusedOnVesselSearch,
    selectedVesselIdentity: vesselIdentity,
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    rightMenuIsOpen,
    healthcheckTextWarning
  } = useSelector(state => state.global)

  const [searchText, setSearchText] = useState('')
  const [vesselsHasBeenUpdated, setVesselsHasBeenUpdated] = useState(false)
  const [foundVesselsOnMap, setFoundVesselsOnMap] = useState([])
  const [foundVesselsFromAPI, setFoundVesselsFromAPI] = useState([])
  const [selectedVesselIdentity, setSelectedVesselIdentity] = useState(null)
  const firstUpdate = useRef(true)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(focusOnVesselSearch())
      setSearchText('')
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    let doNotFocus = false
    if (selectedVesselIdentity &&
      vesselIdentity &&
      vesselIdentity === selectedVesselIdentity) {
      doNotFocus = true
      setVesselsHasBeenUpdated(true)
      dispatch(focusOnVesselSearch(null, doNotFocus))

      return
    }

    setVesselsHasBeenUpdated(false)
    dispatch(focusOnVesselSearch(null, doNotFocus))
    setSelectedVesselIdentity(vesselIdentity)
  }, [vesselIdentity])

  function getTextForSearch (text) {
    return text
      .toLowerCase()
      .replace(/[ ]/g, '')
      .replace(/[']/g, '')
      .replace(/["]/g, '')
  }

  function findMatchingFeature (feature) {
    return (feature.getProperties().internalReferenceNumber &&
      getTextForSearch(feature.getProperties().internalReferenceNumber).includes(getTextForSearch(searchText))) ||
      (feature.getProperties().externalReferenceNumber &&
        getTextForSearch(feature.getProperties().externalReferenceNumber).includes(getTextForSearch(searchText))) ||
      (feature.getProperties().mmsi &&
        getTextForSearch(feature.getProperties().mmsi).includes(getTextForSearch(searchText))) ||
      (feature.getProperties().ircs &&
        getTextForSearch(feature.getProperties().ircs).includes(getTextForSearch(searchText))) ||
      (feature.getProperties().vesselName &&
        getTextForSearch(feature.getProperties().vesselName).includes(getTextForSearch(searchText)))
  }

  function getFoundVesselsOnMap () {
    const vessels = vesselsLayerSource.getFeatures().map(feature => {
      if (findMatchingFeature(feature)) {
        return feature
      }

      return null
    }).filter(vessel => vessel)

    const firstThirtyVessels = vessels.slice(0, 30)

    return firstThirtyVessels
  }

  function removeDuplicatedFoundVessels (foundVesselsFromAPI, foundVesselsOnMap) {
    return foundVesselsFromAPI.filter(vessel => {
      return !(
        (vessel.internalReferenceNumber
          ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().internalReferenceNumber === vessel.internalReferenceNumber)
          : false) ||
        (vessel.externalReferenceNumber
          ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().externalReferenceNumber === vessel.externalReferenceNumber)
          : false) ||
        (vessel.ircs
          ? foundVesselsOnMap.some(vesselFromMap => vesselFromMap.getProperties().ircs === vessel.ircs)
          : false))
    })
  }

  useEffect(() => {
    if (searchText.length > 1) {
      const foundVesselsOnMap = getFoundVesselsOnMap()
      setFoundVesselsOnMap(foundVesselsOnMap)

      dispatch(searchVessels(searchText.toUpperCase())).then(foundVesselsFromAPI => {
        const distinctFoundVessels = removeDuplicatedFoundVessels(foundVesselsFromAPI, foundVesselsOnMap)
        setFoundVesselsFromAPI(distinctFoundVessels)
      })
    } else {
      setFoundVesselsOnMap([])
      setFoundVesselsFromAPI([])
    }
  }, [searchText, setFoundVesselsOnMap, selectedVesselIdentity])

  useEffect(() => {
    firstUpdate.current = false
    document.addEventListener('keydown', escapeFromKeyboard, false)
  }, [])

  useEffect(() => {
    if (selectedVesselIdentity) {
      if (!vesselsHasBeenUpdated) {
        if (!vesselIdentity ||
          (vesselIdentity && !vesselsAreEquals(selectedVesselIdentity, vesselIdentity))) {
          dispatch(showVesselTrackAndSidebar(selectedVesselIdentity, true, false))
        }

        setSearchText('')
        setFoundVesselsFromAPI([])
        setFoundVesselsOnMap([])
      }
    } else {
      dispatch(unselectVessel())
    }
  }, [selectedVesselIdentity])

  const escapeFromKeyboard = event => {
    const escapeKeyCode = 27
    if (event.keyCode === escapeKeyCode) {
      dispatch(focusOnVesselSearch())
      setSearchText('')
    }
  }

  return (
    <>
      <Wrapper
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsOpen={rightMenuIsOpen}
        vesselSidebarIsOpen={vesselSidebarIsOpen}
        selectedVesselIdentity={selectedVesselIdentity}
        ref={wrapperRef}
        data-cy={'vessel-name'}>
        <SearchBoxField>
          {
            !isFocusedOnVesselSearch && selectedVesselIdentity
              ? <SelectedVessel
                selectedVesselIdentity={selectedVesselIdentity}
                setSelectedVesselIdentity={setSelectedVesselIdentity}
              />
              : <SearchBoxInput
                ref={input => selectedVesselIdentity ? input && input.focus() : null}
                type="text"
                firstUpdate={firstUpdate}
                value={searchText}
                placeholder={'Rechercher un navire...'}
                onChange={e => setSearchText(e.target.value)}
                isFocusedOnVesselSearch={isFocusedOnVesselSearch}
                vesselSidebarIsOpen={vesselSidebarIsOpen}
              />
          }
        </SearchBoxField>
        <VesselSearchList
          foundVesselsOnMap={foundVesselsOnMap}
          foundVesselsFromAPI={foundVesselsFromAPI}
          setVesselsHasBeenUpdated={setVesselsHasBeenUpdated}
          setSelectedVesselIdentity={setSelectedVesselIdentity}
          setSearchText={setSearchText}
          searchText={searchText}
        />
      </Wrapper>
      <SearchButton
        healthcheckTextWarning={healthcheckTextWarning}
        title={'Rechercher un navire'}
        onMouseEnter={() => dispatch(expandRightMenu())}
        onClick={() => dispatch(focusOnVesselSearch(focusState.CLICK_SEARCH_ICON, !selectedVessel))}
        rightMenuIsOpen={rightMenuIsOpen}
        isOpen={selectedVessel}
        selectedVessel={selectedVessel}>
        <SearchIcon
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </SearchButton>
    </>)
}

const Wrapper = styled(MapComponentStyle)`
  position: absolute;
  display: inline-block;
  top: 10px;
  right: 55px;
  z-index: 1000;
  color: ${COLORS.textWhite};
  text-decoration: none;
  border: none;
  background-color: none;
  border-radius: 2px;
  padding: 0 0 0 0;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  
  animation: ${props => props.selectedVesselIdentity
  ? props.rightMenuIsOpen && props.vesselSidebarIsOpen
    ? 'vessel-search-box-opening-with-right-menu-hover'
    : 'vessel-search-box-closing-with-right-menu-hover'
  : null} 0.3s ease forwards;
  
  @keyframes vessel-search-box-opening-with-right-menu-hover {
    0%   { right: 10px;   }
    100% { right: 55px; }
  }

  @keyframes vessel-search-box-closing-with-right-menu-hover {
    0% { right: 55px; }
    100%   { right: 10px;   }
  }
  
  :hover, :focus {
    background-color: none;
  }
`

const SearchBoxField = styled.div`
  display: flex;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  border-radius: 2px;
  color: ${COLORS.gunMetal};
  font-size: 0.8em;
  height: 40px;
  width: ${props => props.isFocusedOnVesselSearch || props.vesselSidebarIsOpen ? '500px' : '320px'};
  padding: 0 5px 0 10px;
  flex: 3;
  
  animation: ${props => props.isFocusedOnVesselSearch && !props.vesselSidebarIsOpen ? 'vessel-search-closing' : ''}  0.7s ease forwards;

  @keyframes vessel-search-closing {
    0% { width: 500px; }
    100%   { width: 320px;   }
  }
  
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
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselsSearchBox
