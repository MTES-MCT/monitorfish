import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import Highlighter from "react-highlight-words";

import {ReactComponent as SearchIconSVG} from "../components/icons/Loupe.svg";
import LayersEnum from "../domain/entities/layers";
import showVesselTrackAndSidebar from "../domain/use_cases/showVesselTrackAndSidebar";
import {useDispatch, useSelector} from "react-redux";
import {COLORS} from "../constants/constants";
import {ReactComponent as CloseIconSVG} from "../components/icons/Croix_grise.svg";
import unselectVessel from "../domain/use_cases/unselectVessel";
import searchVessels from "../domain/use_cases/searchVessels";
import {getVesselFeatureAndIdentity, getVesselIdentityFromFeature} from "../domain/entities/vessel";
import countries from "i18n-iso-countries";
import focusOnVesselSearch, {focusState} from "../domain/use_cases/focusOnVesselSearch";

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const VesselsSearchBox = () => {
    const layers = useSelector(state => state.layer.layers)
    const vesselSidebarIsOpen = useSelector(state => state.vessel.vesselSidebarIsOpen)
    const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)
    const vesselFeatureAndIdentity = useSelector(state => state.vessel.selectedVesselFeatureAndIdentity)
    const dispatch = useDispatch()

    const [searchText, setSearchText] = useState('');
    const [vesselsHasBeenUpdated, setVesselsHasBeenUpdated] = useState(false);
    const [foundVesselsOnMap, setFoundVesselsOnMap] = useState([]);
    const [foundVesselsFromAPI, setFoundVesselsFromAPI] = useState([]);
    const [selectedVesselFeatureAndIdentity, setSelectedVesselFeatureAndIdentity] = useState(null);
    const firstUpdate = useRef(true);

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                dispatch(focusOnVesselSearch())
                setSearchText('')
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, selectedVesselFeatureAndIdentity]);

    useEffect(() => {
        let isUpdatedVessel = false
        if(selectedVesselFeatureAndIdentity &&
            selectedVesselFeatureAndIdentity.identity &&
            vesselFeatureAndIdentity &&
            vesselFeatureAndIdentity.identity === selectedVesselFeatureAndIdentity.identity) {
            isUpdatedVessel = true
            setVesselsHasBeenUpdated(true)
            dispatch(focusOnVesselSearch(null, isUpdatedVessel))

            return
        }

        setVesselsHasBeenUpdated(false)
        dispatch(focusOnVesselSearch(null, isUpdatedVessel))
        setSelectedVesselFeatureAndIdentity(vesselFeatureAndIdentity)
    }, [vesselFeatureAndIdentity])

    function getTextForSearch(text) {
        return text
            .toLowerCase()
            .replace(/[ ]/g, '')
            .replace(/[']/g, '')
            .replace(/["]/g, '')
    }

    function findMatchingFeature(feature) {
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

    function getFoundVesselsOnMap(vesselsLayer) {
        let vessels = vesselsLayer.getSource().getFeatures().map(feature => {
            if (findMatchingFeature(feature)) {
                return feature
            }
        }).filter(vessel => vessel)

        const firstThirtyVessels = vessels.slice(0, 30);

        return firstThirtyVessels
    }

    function removeDuplicatedFoundVessels(foundVesselsFromAPI, foundVesselsOnMap) {
        return foundVesselsFromAPI.filter(vessel => {
            return !(foundVesselsOnMap.some(vesselFromMap =>
                    vesselFromMap.getProperties().internalReferenceNumber === vessel.internalReferenceNumber) &&
                foundVesselsOnMap.some(vesselFromMap =>
                    vesselFromMap.getProperties().externalReferenceNumber === vessel.externalReferenceNumber) &&
                foundVesselsOnMap.some(vesselFromMap =>
                    vesselFromMap.getProperties().ircs === vessel.ircs))
        });
    }

    useEffect(() => {
        if (searchText.length > 1) {
            let vesselsLayer = layers.find(layer => layer.className_ === LayersEnum.VESSELS)
            let foundVesselsOnMap = getFoundVesselsOnMap(vesselsLayer);
            setFoundVesselsOnMap(foundVesselsOnMap)

            dispatch(searchVessels(searchText)).then(foundVesselsFromAPI => {
                let distinctFoundVessels = removeDuplicatedFoundVessels(foundVesselsFromAPI, foundVesselsOnMap)
                setFoundVesselsFromAPI(distinctFoundVessels)
            })
        } else {
            setFoundVesselsOnMap([])
            setFoundVesselsFromAPI([])
        }
    }, [searchText, setFoundVesselsOnMap, selectedVesselFeatureAndIdentity])

    useEffect(() => {
            firstUpdate.current = false
    }, [])

    useEffect(() => {
        if (selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.identity) {
            if(!vesselsHasBeenUpdated) {
                dispatch(showVesselTrackAndSidebar(selectedVesselFeatureAndIdentity, true, false));

                setSearchText('')
                setFoundVesselsFromAPI([])
                setFoundVesselsOnMap([])
            }
        } else {
            dispatch(unselectVessel())
        }
    }, [selectedVesselFeatureAndIdentity])

    function getListItem(id, flagState, internalReferenceNumber, externalReferenceNumber, ircs, mmsi, vesselName, vessel) {
        return (
            <ListItem
                onClick={() => {
                    dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT))
                    setVesselsHasBeenUpdated(false)
                    setSelectedVesselFeatureAndIdentity(vessel)
                    setSearchText('')
                }}
                key={id}>
                <div>
                    {flagState ?
                        <Flag rel="preload"
                              title={countries.getName(flagState, "fr")}
                              src={`flags/${flagState.toLowerCase()}.svg`}/> : null}
                    <Name>
                        <Highlighter
                            highlightClassName="highlight"
                            searchWords={[searchText]}
                            autoEscape={true}
                            textToHighlight={vesselName ? vesselName : 'SANS NOM'}
                        />
                    </Name>
                </div>
                <Information>
                    <CFR>
                        <Highlighter
                            highlightClassName="highlight"
                            searchWords={[searchText]}
                            autoEscape={true}
                            textToHighlight={internalReferenceNumber ? internalReferenceNumber : ''}
                        />
                        {internalReferenceNumber ? null : <Light>Inconnu</Light>}
                        {' '}<Light>(CFR)</Light>
                    </CFR>
                    <ExtNum>
                        <Highlighter
                            highlightClassName="highlight"
                            searchWords={[searchText]}
                            autoEscape={true}
                            textToHighlight={externalReferenceNumber ? externalReferenceNumber : ''}
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
                            textToHighlight={mmsi ? mmsi : ''}
                        />
                        {mmsi ? null : <Light>Inconnu</Light>}
                        {' '}<Light>(MMSI)</Light>
                    </MMSI>
                    <CallSign>
                        <Highlighter
                            highlightClassName="highlight"
                            searchWords={[searchText]}
                            autoEscape={true}
                            textToHighlight={ircs ? ircs : ''}
                        />
                        {ircs ? null : <Light>Inconnu</Light>}
                        {' '}<Light>(Call Sign)</Light>
                    </CallSign>
                </Information>
            </ListItem>
        );
    }

    return (
        <Wrapper ref={wrapperRef}>
            <SearchBoxField>
                {
                    !isFocusedOnVesselSearch && selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.identity ? <SelectedVessel
                        onClick={() => {
                            if(vesselSidebarIsOpen) {
                                dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_TITLE))
                            }
                        }}
                        vesselSidebarIsOpen={vesselSidebarIsOpen}
                        vesselName={selectedVesselFeatureAndIdentity.identity.vesselName}
                        isFocusedOnVesselSearch={isFocusedOnVesselSearch}
                    >
                        {selectedVesselFeatureAndIdentity.identity.flagState ? <Flag
                            title={countries.getName(selectedVesselFeatureAndIdentity.identity.flagState, "fr")}
                            src={`flags/${selectedVesselFeatureAndIdentity.identity.flagState.toLowerCase()}.svg`} /> : null}
                        <VesselName>
                            {selectedVesselFeatureAndIdentity.identity.vesselName}
                            {' '}
                            {
                                selectedVesselFeatureAndIdentity.identity.flagState && selectedVesselFeatureAndIdentity.identity.flagState !== 'UNDEFINED' ? <>({selectedVesselFeatureAndIdentity.identity.flagState})</> : <>(INCONNU)</>
                            }
                        </VesselName>
                        <CloseIcon onClick={() => {
                            setSelectedVesselFeatureAndIdentity(null)
                        }}/>
                    </SelectedVessel> : <SearchBoxInput
                        ref={input => selectedVesselFeatureAndIdentity ? input && input.focus() : null}
                        type="text"
                        firstUpdate={firstUpdate}
                        value={searchText}
                        placeholder={'Rechercher un navire...'}
                        onChange={e => setSearchText(e.target.value)}
                        isFocusedOnVesselSearch={isFocusedOnVesselSearch}
                        vesselSidebarIsOpen={vesselSidebarIsOpen}
                    />
                }
                {
                    !isFocusedOnVesselSearch && selectedVesselFeatureAndIdentity ? null : <SearchIcon />
                }
            </SearchBoxField>
            {
                (foundVesselsOnMap && foundVesselsOnMap.length) ||
                (foundVesselsFromAPI && foundVesselsFromAPI.length) ? <Results>
                    <List>
                        {
                            foundVesselsOnMap.map((feature, index) => {
                                let vessel = getVesselIdentityFromFeature(feature)

                                return getListItem(
                                    feature.id_,
                                    feature.getProperties().flagState,
                                    feature.getProperties().internalReferenceNumber,
                                    feature.getProperties().externalReferenceNumber,
                                    feature.getProperties().ircs,
                                    feature.getProperties().mmsi,
                                    feature.getProperties().vesselName,
                                    getVesselFeatureAndIdentity(feature, vessel))
                            })
                        }
                        {
                            foundVesselsFromAPI.map((vessel, index) => {
                                return getListItem(
                                    index,
                                    vessel.flagState,
                                    vessel.internalReferenceNumber,
                                    vessel.externalReferenceNumber,
                                    vessel.ircs,
                                    vessel.mmsi,
                                    vessel.vesselName,
                                    getVesselFeatureAndIdentity(null, vessel))
                            })
                        }
                    </List>
                </Results> : ''
            }
        </Wrapper>)
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
  margin-right: 7px;
  height: 1.5em;
  margin-top: 8px;
  cursor: pointer;
`

const Wrapper = styled.div`
  position: absolute;
  display: inline-block;
  top: 10px;
  right: 7px;
  z-index: 9999999;
  color: ${COLORS.textWhite};
  text-decoration: none;
  border: none;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 3px 3px 0 3px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  
  :hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

const Results = styled.div`
  background: white;
  color: ${COLORS.grayDarkerThree};
`;

const SearchBoxField = styled.div`
  display: flex;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-radius: 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 0.8em;
  height: 40px;
  width: ${props => props.isFocusedOnVesselSearch || props.vesselSidebarIsOpen ? '460px' : '300px'};
  padding: 0 5px 0 10px;
  flex: 3;
  
  animation: ${props => props.isFocusedOnVesselSearch && !props.vesselSidebarIsOpen ? 'vessel-search-closing' : ''}  0.7s ease forwards;

  @keyframes vessel-search-closing {
    0% { width: 460px; }
    100%   { width: 300px;   }
  }
  
  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`;

const SelectedVessel = styled.div`
  font-weight: bolder;
  margin: 0;
  background-color: ${COLORS.grayDarkerThree};
  border: none;
  border-radius: 0;
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

const SearchIcon = styled(SearchIconSVG)`
  opacity: 1;
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayDarkerThree};
  cursor: pointer;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
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
