import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Highlighter from 'react-highlight-words'

import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
import showVesselTrackAndSidebar from '../domain/use_cases/showVesselTrackAndSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../constants/constants'
import { ReactComponent as CloseIconSVG } from '../components/icons/Croix_grise.svg'
import unselectVessel from '../domain/use_cases/unselectVessel'
import searchVessels from '../domain/use_cases/searchVessels'
import {
  getVesselIdentityFromFeature,
  getVesselIdentityFromVessel,
  vesselsAreEquals
} from '../domain/entities/vessel'
import countries from 'i18n-iso-countries'
import focusOnVesselSearch, { focusState } from '../domain/use_cases/focusOnVesselSearch'
import { expandRightMenu } from '../domain/reducers/Global'
import { MapComponentStyle } from '../components/commonStyles/MapComponent.style'
import { MapButtonStyle } from '../components/commonStyles/MapButton.style'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

const VesselsSearchBox = () => {
  const vesselsLayerSource = useSelector(state => state.vessel.vesselsLayerSource)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselSidebarIsOpen = useSelector(state => state.vessel.vesselSidebarIsOpen)
  const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)
  const vesselIdentity = useSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const dispatch = useDispatch()

  const [searchText, setSearchText] = useState('')
  const [vesselsHasBeenUpdated, setVesselsHasBeenUpdated] = useState(false)
  const [foundVesselsOnMap, setFoundVesselsOnMap] = useState([])
  const [foundVesselsFromAPI, setFoundVesselsFromAPI] = useState([])
  const [selectedVesselIdentity, setSelectedVesselIdentity] = useState(null)
  const firstUpdate = useRef(true)

  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        dispatch(focusOnVesselSearch())
        setSearchText('')
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef, selectedVesselIdentity])

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

  function getListItem (id, flagState, internalReferenceNumber, externalReferenceNumber, ircs, mmsi, vesselName, vessel) {
    return (
      <ListItem
        onClick={() => {
          dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT))
          setVesselsHasBeenUpdated(false)
          setSelectedVesselIdentity(vessel)
          setSearchText('')
        }}
        key={id}>
        <div>
          {flagState
            ? <Flag rel="preload"
                    title={countries.getName(flagState, 'fr')}
                    src={`flags/${flagState.toLowerCase()}.svg`}/>
            : null}
          <Name>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={vesselName || 'SANS NOM'}
            />
          </Name>
        </div>
        <Information>
          <CFR>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={internalReferenceNumber || ''}
            />
            {internalReferenceNumber ? null : <Light>Inconnu</Light>}
            {' '}<Light>(CFR)</Light>
          </CFR>
          <ExtNum>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={externalReferenceNumber || ''}
            />
            {externalReferenceNumber ? null : <Light>Inconnu</Light>}
            {' '}<Light>(Marq. Ext.)</Light>
          </ExtNum>
        </Information>
        <Information>
          <MMSI>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={mmsi || ''}
            />
            {mmsi ? null : <Light>Inconnu</Light>}
            {' '}<Light>(MMSI)</Light>
          </MMSI>
          <CallSign>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={ircs || ''}
            />
            {ircs ? null : <Light>Inconnu</Light>}
            {' '}<Light>(Call Sign)</Light>
          </CallSign>
        </Information>
      </ListItem>
    )
  }

  return (
    <>
      <Wrapper
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsOpen={rightMenuIsOpen}
        vesselSidebarIsOpen={vesselSidebarIsOpen}
        selectedVesselIdentity={selectedVesselIdentity}
        ref={wrapperRef}>
        <SearchBoxField>
          {
            !isFocusedOnVesselSearch && selectedVesselIdentity
              ? <SelectedVessel
                onClick={() => {
                  if (vesselSidebarIsOpen) {
                    dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_TITLE))
                  }
                }}
                vesselSidebarIsOpen={vesselSidebarIsOpen}
                vesselName={selectedVesselIdentity.vesselName}
                isFocusedOnVesselSearch={isFocusedOnVesselSearch}
              >
                {selectedVesselIdentity.flagState
                  ? <Flag
                    title={countries.getName(selectedVesselIdentity.flagState, 'fr')}
                    src={`flags/${selectedVesselIdentity.flagState.toLowerCase()}.svg`}/>
                  : null}
                <VesselName>
                  {selectedVesselIdentity.vesselName}
                  {' '}
                  {
                    selectedVesselIdentity.flagState !== 'UNDEFINED' ? <>({selectedVesselIdentity.flagState})</> : <>(INCONNU)</>
                  }
                </VesselName>
                <CloseIcon onClick={() => {
                  setSelectedVesselIdentity(null)
                }}/>
              </SelectedVessel>
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
        {
          (foundVesselsOnMap && foundVesselsOnMap.length) ||
          (foundVesselsFromAPI && foundVesselsFromAPI.length)
            ? <Results>
              <List>
                {
                  foundVesselsOnMap.map(feature => {
                    const vessel = getVesselIdentityFromFeature(feature)

                    return getListItem(
                      feature.id_,
                      vessel.flagState,
                      vessel.internalReferenceNumber,
                      vessel.externalReferenceNumber,
                      vessel.ircs,
                      vessel.mmsi,
                      vessel.vesselName,
                      vessel)
                  })
                }
                {
                  foundVesselsFromAPI.map((vessel, index) => {
                    const vesselIdentity = getVesselIdentityFromVessel(vessel)

                    return getListItem(
                      index,
                      vesselIdentity.flagState,
                      vesselIdentity.internalReferenceNumber,
                      vesselIdentity.externalReferenceNumber,
                      vesselIdentity.ircs,
                      vesselIdentity.mmsi,
                      vesselIdentity.vesselName,
                      vesselIdentity)
                  })
                }
              </List>
            </Results>
            : ''
        }
      </Wrapper>
      <SearchButton
        healthcheckTextWarning={healthcheckTextWarning}
        title={'Rechercher un navire'}
        onMouseEnter={() => dispatch(expandRightMenu())}
        onClick={() => dispatch(focusOnVesselSearch(focusState.CLICK_SEARCH_ICON, !selectedVessel))}
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}>
        <SearchIcon
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </SearchButton>
    </>)
}

const Light = styled.span`
  font-weight: 300; 
`

const Name = styled.span`
  display: inline-block;
  margin-top: 10px;
  margin-left: 10px;
  font-weight: 400;
  font-size: 13px;
`

const Information = styled.div`
  display: flex;
  font-size: 13px;
  margin-left: 5px;
  color: ${COLORS.textGray};
`

const CallSign = styled.div`
  font-size: 13px;
  flex: 2;
  min-width: 130px;
`

const MMSI = styled.div`
  font-size: 13px;
  flex: 1;
  min-width: 140px;
`

const ExtNum = styled.div`
  font-size: 13px;
  flex: 2;
  min-width: 130px;
`

const CFR = styled.div`
  font-size: 13px;
  flex: 1;
  min-width: 140px;
`

const Flag = styled.img`
  font-size: 25px;
  margin-left: 5px;
  display: inline-block;
  width: 1em;                      
  height: 1em;                      
  vertical-align: middle;
`

const VesselName = styled.span`
  display: inline-block;
  color: ${COLORS.grayBackground};
  margin: 0 0 0 10px;
  line-height: 1.9em;
  vertical-align: middle;
  font-size: 20px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 20px;
  float: right;
  padding: 8px 7px 7px 7px;
  height: 1.5em;
  cursor: pointer;
`

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

const Results = styled.div`
  background: white;
  color: ${COLORS.grayDarkerThree};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
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
  color: ${COLORS.grayDarkerThree};
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
    border-bottom: 1px ${COLORS.gray} solid;
  }
`

const SelectedVessel = styled.div`
  font-weight: bolder;
  margin: 0;
  background-color: ${COLORS.grayDarkerThree};
  border: none;
  border-radius: 0;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${COLORS.grayBackground};
  height: 40px;
  width: 485px;
  padding: 0 5px 0 10px;
  flex: 3;
  text-align: left;
  cursor: text;
  animation: ${props => props.firstUpdate && !props.vesselSidebarIsOpen ? '' : props.vesselSidebarIsOpen && !props.isFocusedOnVesselSearch ? 'vessel-search-opening' : ''} 0.7s ease forwards;

  @keyframes vessel-search-opening {
    0%   { width: ${props => props.vesselName ? '485px' : '320px'};   }
    100% { width: 485px; }
  }

  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`

const SearchButton = styled(MapButtonStyle)`
  width: 40px;
  height: 40px;
  right: 10px;
  top: 10px;
  z-index: 99;
  background: ${props => props.selectedVessel ? COLORS.grayDarkerTwo : COLORS.grayDarkerThree};
  cursor: pointer;
  border-radius: 2px;
  position: absolute;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.selectedVessel ? COLORS.grayDarkerTwo : COLORS.grayDarkerThree};
  }
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 0 5px 5px 7px;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  border-bottom: ${COLORS.grayDarker} 1px solid;
  
  :hover {
    background: ${COLORS.grayBackground};
  }
`

export default VesselsSearchBox
