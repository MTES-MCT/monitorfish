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
import {setSearchVesselWhileVesselSelected} from "../domain/reducers/Vessel";

const VesselsSearchBox = () => {
    const layers = useSelector(state => state.layer.layers)
    const vesselSidebarIsOpen = useSelector(state => state.vessel.vesselSidebarIsOpen)
    const selectedVesselFeature = useSelector(state => state.vessel.selectedVesselFeature)
    const dispatch = useDispatch()

    const [searchText, setSearchText] = useState('');
    const [foundVessels, setFoundVessels] = useState([]);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [vesselNameIsShown, setVesselNameIsShown] = useState(false);
    const [searchingWhileVesselSelected, setSearchingWhileVesselSelected] = useState(false);
    const firstUpdate = useRef(true);

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if(selectedVessel) {
                    if(!vesselNameIsShown && vesselSidebarIsOpen && !searchingWhileVesselSelected) {
                        setSearchingWhileVesselSelected(true)
                    } else {
                        setSearchingWhileVesselSelected(false)
                    }
                    setVesselNameIsShown(true)
                    setSearchText('')
                } else {
                    setSearchingWhileVesselSelected(false)
                    setVesselNameIsShown(false)
                    setSearchText('')
                }
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, vesselNameIsShown, selectedVessel, vesselSidebarIsOpen, searchingWhileVesselSelected]);

    useEffect(() => {
        setSelectedVessel(selectedVesselFeature)

        if(selectedVesselFeature) {
            setVesselNameIsShown(true)
        }
    }, [selectedVesselFeature])

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

    useEffect(() => {
        if (searchText.length > 1) {
            layers
                .filter(layer => layer.className_ === LayersEnum.VESSELS)
                .forEach(vesselsLayer => {
                    let vessels = vesselsLayer.getSource().getFeatures().map(feature => {
                        if (findMatchingFeature(feature)) {
                            return feature
                        }
                    }).filter(vessel => vessel)

                    const firstFiftyElements = vessels.slice(0, 50);
                    setFoundVessels(firstFiftyElements)
                })
        } else {
            setFoundVessels([])
        }
    }, [searchText, setFoundVessels])

    useEffect(() => {
            firstUpdate.current = false
    }, [])

    useEffect(() => {
        if (selectedVessel) {
            dispatch(showVesselTrackAndSidebar(selectedVessel, true, false));
            setFoundVessels([])
            setSearchText('')
        } else {
            dispatch(unselectVessel())
        }
    }, [selectedVessel])

    useEffect(() => {
        dispatch(setSearchVesselWhileVesselSelected(searchingWhileVesselSelected))
    }, [searchingWhileVesselSelected])

    return (
        <Wrapper ref={wrapperRef}>
            <SearchBoxField>
                {
                    vesselNameIsShown && selectedVessel ? <SelectedVessel
                        onClick={() => {
                            setVesselNameIsShown(false)
                            if(vesselSidebarIsOpen) {
                                setSearchingWhileVesselSelected(true)
                            }
                        }}
                        vesselSidebarIsOpen={vesselSidebarIsOpen}
                        selectedVessel={selectedVessel}
                        searchingWhileVesselSelected={searchingWhileVesselSelected}
                    >
                        {selectedVessel.getProperties().flagState ? <Flag src={`flags/${selectedVessel.getProperties().flagState.toLowerCase()}.svg`} /> : null}
                        <VesselName>
                            {selectedVessel.getProperties().vesselName}
                            {' '}
                            {
                                selectedVessel.getProperties().flagState ? <>({selectedVessel.getProperties().flagState})</> : null
                            }
                        </VesselName>
                        <CloseIcon onClick={() => {
                            setSelectedVessel(null)
                            setVesselNameIsShown(null)
                        }}/>
                    </SelectedVessel> : <SearchBoxInput
                        ref={input => selectedVessel ? input && input.focus() : null}
                        type="text"
                        firstUpdate={firstUpdate}
                        value={searchText}
                        placeholder={'Rechercher un navire (nom, CFR, MMSI, etc.)...'}
                        onChange={e => setSearchText(e.target.value)}
                        searchingWhileVesselSelected={searchingWhileVesselSelected}
                        vesselSidebarIsOpen={vesselSidebarIsOpen}
                    />
                }
                {
                    vesselNameIsShown && selectedVessel ? null : <SearchIcon />
                }
            </SearchBoxField>
            {
                foundVessels && foundVessels.length ? <Results>
                    <List>
                        {
                            foundVessels.map((foundVessel, index) => {
                                return (
                                    <ListItem
                                        onClick={() => setSelectedVessel(foundVessel)}>
                                        <div>
                                            {foundVessel.getProperties().flagState ?
                                                <Flag rel="preload" src={`flags/${foundVessel.getProperties().flagState.toLowerCase()}.svg`} /> : null}
                                            <Name>
                                                <Highlighter
                                                    highlightClassName="highlight"
                                                    searchWords={[searchText]}
                                                    autoEscape={true}
                                                    textToHighlight={foundVessel.getProperties().vesselName ? foundVessel.getProperties().vesselName : 'SANS NOM'}
                                                />
                                            </Name>
                                        </div>
                                        <Information>
                                            <CFR>
                                                <Highlighter
                                                    highlightClassName="highlight"
                                                    searchWords={[searchText]}
                                                    autoEscape={true}
                                                    textToHighlight={foundVessel.getProperties().internalReferenceNumber ? foundVessel.getProperties().internalReferenceNumber : ''}
                                                />
                                                {foundVessel.getProperties().internalReferenceNumber ? null : <Light>Inconnu</Light>}
                                                {' '}<Light>(CFR)</Light>
                                            </CFR>
                                            <ExtNum>
                                                <Highlighter
                                                    highlightClassName="highlight"
                                                    searchWords={[searchText]}
                                                    autoEscape={true}
                                                    textToHighlight={foundVessel.getProperties().externalReferenceNumber ? foundVessel.getProperties().externalReferenceNumber : ''}
                                                />
                                                {foundVessel.getProperties().externalReferenceNumber ? null : <Light>Inconnu</Light>}
                                                {' '}<Light>(Marq. Ext.)</Light>
                                            </ExtNum>
                                        </Information>
                                        <Information>
                                            <MMSI>
                                                <Highlighter
                                                    highlightClassName="highlight"
                                                    searchWords={[searchText]}
                                                    autoEscape={true}
                                                    textToHighlight={foundVessel.getProperties().mmsi ? foundVessel.getProperties().mmsi : ''}
                                                />
                                                {foundVessel.getProperties().mmsi ? null : <Light>Inconnu</Light>}
                                                {' '}<Light>(MMSI)</Light>
                                            </MMSI>
                                            <CallSign>
                                                <Highlighter
                                                    highlightClassName="highlight"
                                                    searchWords={[searchText]}
                                                    autoEscape={true}
                                                    textToHighlight={foundVessel.getProperties().ircs ? foundVessel.getProperties().ircs : ''}
                                                />
                                                {foundVessel.getProperties().ircs ? null : <Light>Inconnu</Light>}
                                                {' '}<Light>(Call Sign)</Light>
                                            </CallSign>
                                        </Information>
                                    </ListItem>
                                )
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
  min-width: 130px;
`

const ExtNum = styled.div`
  font-size: 13px;
  flex: 2;
  min-width: 130px;
`

const CFR = styled.div`
  font-size: 13px;
  flex: 1;
  min-width: 130px;
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
  width: ${props => props.searchingWhileVesselSelected || props.vesselSidebarIsOpen ? '460px' : '300px'};
  padding: 0 5px 0 10px;
  flex: 3;
  
  animation: ${props => props.searchingWhileVesselSelected && !props.vesselSidebarIsOpen ? 'vessel-search-closing' : ''}  0.7s ease forwards;

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
  animation: ${props => props.firstUpdate && !props.vesselSidebarIsOpen ? '' : props.vesselSidebarIsOpen && !props.searchingWhileVesselSelected ? 'vessel-search-opening' : ''} 0.7s ease forwards;

  @keyframes vessel-search-opening {
    0%   { width: ${props => props.selectedVessel.getProperties().vesselName ? '485px' : '320px'};   }
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
