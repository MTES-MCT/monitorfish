import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';

import ReactCountryFlag from "react-country-flag"
import {ReactComponent as SearchIconSVG} from "../components/icons/Loupe.svg";
import {ReactComponent as SearchIconDarkSVG} from "../components/icons/Loupe_dark.svg";
import LayersEnum from "../domain/entities/layers";
import showVesselTrackAndSummary from "../domain/use_cases/showVesselTrackAndSummary";
import {useDispatch, useSelector} from "react-redux";
import {COLORS} from "../constants/constants";
import {ReactComponent as CloseIconSVG} from "../components/icons/Croix_grise.svg";
import unselectVessel from "../domain/use_cases/unselectVessel";

const VesselsSearchBox = () => {
    const layers = useSelector(state => state.layer.layers)
    const vesselBoxIsOpen = useSelector(state => state.vessel.vesselBoxIsOpen)
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
                    if(!vesselNameIsShown && vesselBoxIsOpen) {
                        setSearchingWhileVesselSelected(true)
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
    }, [wrapperRef, vesselNameIsShown, selectedVessel, vesselBoxIsOpen]);

    useEffect(() => {
        setSelectedVessel(selectedVesselFeature)

        if(selectedVesselFeature) {
            setVesselNameIsShown(true)
        }
    }, [selectedVesselFeature])

    function findMatchingFeature(feature) {
        return (feature.getProperties().internalReferenceNumber &&
            feature.getProperties().internalReferenceNumber.toLowerCase().includes(searchText.toLowerCase())) ||
            (feature.getProperties().externalReferenceNumber &&
                feature.getProperties().externalReferenceNumber.toLowerCase().includes(searchText.toLowerCase())) ||
            (feature.getProperties().MMSI &&
                feature.getProperties().MMSI.toLowerCase().includes(searchText.toLowerCase())) ||
            (feature.getProperties().vesselName &&
                feature.getProperties().vesselName.toLowerCase().includes(searchText.toLowerCase()));
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
            dispatch(showVesselTrackAndSummary(selectedVessel, true, false));
            setFoundVessels([])
            setSearchText('')
        } else {
            dispatch(unselectVessel())
        }
    }, [selectedVessel])

    function getVesselInformation(foundVessel) {
        const informationList = Array.of(
            foundVessel.getProperties().internalReferenceNumber,
            foundVessel.getProperties().externalReferenceNumber,
            foundVessel.getProperties().MMSI
        ).filter(information => information)

        return <>
            {
                informationList.map((information, index) => {
                    if (index === 2 || index === 3) {
                        return -information
                    }
                    return information
                })
            }
        </>
    }

    return (
        <Wrapper ref={wrapperRef}>
            <SearchBoxField>
                {
                    vesselNameIsShown && selectedVessel ? <SelectedVessel
                        onClick={() => {
                            setVesselNameIsShown(false)
                            if(vesselBoxIsOpen) {
                                setSearchingWhileVesselSelected(true)
                            }
                        }}
                        vesselBoxIsOpen={vesselBoxIsOpen}
                        selectedVessel={selectedVessel}
                        searchingWhileVesselSelected={searchingWhileVesselSelected}
                    >
                        {selectedVessel.getProperties().flagState ? <ReactCountryFlag svg countryCode={selectedVessel.getProperties().flagState}
                                                              style={{lineHeight: '1.9em', fontSize: '21px'}}/> : null}
                        <VesselName>{selectedVessel.getProperties().vesselName}</VesselName>
                        <CloseIcon onClick={() => {
                            setSelectedVessel(null)
                            setVesselNameIsShown(null)
                        }}/>
                    </SelectedVessel> : <SearchBoxInput
                        ref={input => selectedVessel ? input && input.focus() : null}
                        type="text"
                        firstUpdate={firstUpdate}
                        value={searchText}
                        placeholder={'Rechercher un navire...'}
                        onChange={e => setSearchText(e.target.value)}
                        searchingWhileVesselSelected={searchingWhileVesselSelected}
                        vesselBoxIsOpen={vesselBoxIsOpen}
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
                                        onClick={() => setSelectedVessel(foundVessel)}
                                        key={index}>
                                        <b>{foundVessel.getProperties().vesselName ? foundVessel.getProperties().vesselName : 'SANS NOM'}</b>
                                        {foundVessel.getProperties().flagState ?
                                            <ReactCountryFlag countryCode={foundVessel.getProperties().flagState}
                                                              style={{float: 'right', marginTop: '0.5em'}}/> : null}
                                        <br/>
                                        {getVesselInformation(foundVessel)}
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </Results> : ''
            }

        </Wrapper>)
}

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
  width: ${props => props.searchingWhileVesselSelected || props.vesselBoxIsOpen ? '460px' : '269px'};
  padding: 0 5px 0 10px;
  flex: 3;
  
  animation: ${props => props.searchingWhileVesselSelected && !props.vesselBoxIsOpen ? 'vessel-search-closing' : ''}  0.7s ease forwards;

  @keyframes vessel-search-closing {
    0% { width: 460px; }
    100%   { width: 269px;   }
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
  width: ${props => props.selectedVessel && props.vesselBoxIsOpen && props.searchingWhileVesselSelected ? '485px' : '300px'};
  padding: 0 5px 0 10px;
  flex: 3;
  text-align: left;
  cursor: text;
  animation: ${props => props.firstUpdate && !props.vesselBoxIsOpen ? '' : props.vesselBoxIsOpen && !props.searchingWhileVesselSelected ? 'vessel-search-opening' : ''} 0.7s ease forwards;

  @keyframes vessel-search-opening {
    0%   { width: 300px;   }
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

const SearchIconDark = styled(SearchIconDarkSVG)`
  opacity: 1;
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayBackground};
  cursor: pointer;
`


const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 200px;
`

const ListItem = styled.li`
  padding: 2px 5px 2px 5px;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  border-bottom: ${COLORS.grayDarker} 1px solid;
  
  :hover {
    background: ${COLORS.grayBackground};
  }
`


export default VesselsSearchBox
