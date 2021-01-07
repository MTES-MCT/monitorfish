import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {COLORS} from "../constants/constants";
import {ReactComponent as SearchIconSVG} from "./icons/Loupe.svg";

function findIfSearchStringIncludedInProperty(zone, propertiesToSearch, searchText) {
    return zone[propertiesToSearch] ? zone[propertiesToSearch].toLowerCase().includes(searchText.toLowerCase()) : false;
}

const RegulatoryZoneSelectionSearchInput = props => {
    const [placeSearchText, setPlaceSearchText] = useState('');
    const [gearSearchText, setGearSearchText] = useState('');
    const [speciesSearchText, setSpeciesSearchText] = useState('');
    const [regulatoryReferencesSearchText, setRegulatoryReferenceSearchText] = useState('');
    const [focusPlaceSearchText, setFocusPlaceSearchText] = useState(true);

    useEffect(() => {
        if(props.openBox) {
            setFocusPlaceSearchText(true)
        }
    }, [props.openBox])

    useEffect(() => {
        if (props.initSearchFields) {
            setPlaceSearchText('')
            setGearSearchText('')
            setSpeciesSearchText('')
            setRegulatoryReferenceSearchText('')
            props.setInitSearchFields(false)
        }
    }, [props.initSearchFields])

    const searchFields = {
        "placeSearchText": {
            "searchText": placeSearchText,
            "properties": ['layerName', 'zone', 'region', 'seafront']
        },
        "gearSearchText": {
            "searchText": gearSearchText,
            "properties": ['gears']
        },
        "speciesSearchText": {
            "searchText": speciesSearchText,
            "properties": ['species']
        },
        "regulatoryReferencesSearchText": {
            "searchText": regulatoryReferencesSearchText,
            "properties": ['regulatoryReferences']
        }
    }

    useEffect(() => {
        if(placeSearchText.length < 1 &&
            gearSearchText.length < 1 &&
            regulatoryReferencesSearchText.length < 1 &&
            speciesSearchText.length < 1) {
            props.setFoundRegulatoryZones({})
            return
        }

        let foundRegulatoryZones = {}
        Object.keys(searchFields).forEach(searchProperty => {
            if(searchFields[searchProperty].searchText.length > 0) {
                let searchFieldFoundRegulatoryZones
                if(searchFields[searchProperty].properties === searchFields.gearSearchText.properties) {
                    searchFieldFoundRegulatoryZones = searchGears(
                        searchFields[searchProperty].searchText,
                        props.regulatoryZones)
                } else {
                    searchFieldFoundRegulatoryZones = search(
                        searchFields[searchProperty].searchText,
                        searchFields[searchProperty].properties,
                        props.regulatoryZones)
                }

                if(Object.keys(foundRegulatoryZones).length === 0) {
                    foundRegulatoryZones = searchFieldFoundRegulatoryZones
                } else {
                    foundRegulatoryZones = getMergedRegulatoryZones(foundRegulatoryZones, searchFieldFoundRegulatoryZones);
                }
            }
        })
        props.setFoundRegulatoryZones(foundRegulatoryZones)

    }, [speciesSearchText, gearSearchText, placeSearchText, regulatoryReferencesSearchText])

    function getMergedRegulatoryZones(foundRegulatoryZones, searchFieldFoundRegulatoryZones) {
        let mergedRegulatoryZones = {}

        Object.keys(foundRegulatoryZones).forEach(regulatoryZone => {
            foundRegulatoryZones[regulatoryZone].forEach(subZone => {
                if (searchFieldFoundRegulatoryZones[regulatoryZone] &&
                    searchFieldFoundRegulatoryZones[regulatoryZone].length &&
                    searchFieldFoundRegulatoryZones[regulatoryZone].some(searchSubZone =>
                        searchSubZone.layerName === subZone.layerName &&
                        searchSubZone.zone === subZone.zone
                    )) {
                    mergedRegulatoryZones[regulatoryZone] = mergedRegulatoryZones[regulatoryZone] ? mergedRegulatoryZones[regulatoryZone].concat(subZone) : [].concat(subZone)
                }
            })
        })

        return mergedRegulatoryZones
    }

    function search(searchText, propertiesToSearch, regulatoryZones) {
        if (regulatoryZones) {
            let foundRegulatoryZones = {...regulatoryZones}

            Object.keys(foundRegulatoryZones)
                .forEach(key => {
                    foundRegulatoryZones[key] = foundRegulatoryZones[key]
                        .filter(zone => {
                            switch (propertiesToSearch.length) {
                                case 1: {
                                    return findIfSearchStringIncludedInProperty(zone, propertiesToSearch[0], searchText)
                                }
                                case 2: {
                                    return findIfSearchStringIncludedInProperty(zone, propertiesToSearch[0], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[1], searchText)
                                }
                                case 3: {
                                    return findIfSearchStringIncludedInProperty(zone, propertiesToSearch[0], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[1], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[2], searchText)
                                }
                                case 4: {
                                    return findIfSearchStringIncludedInProperty(zone, propertiesToSearch[0], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[1], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[2], searchText) ||
                                        findIfSearchStringIncludedInProperty(zone, propertiesToSearch[3], searchText)
                                }
                                default: {
                                    return false
                                }
                            }
                        })

                    if (!foundRegulatoryZones[key] || !foundRegulatoryZones[key].length > 0) {
                        delete foundRegulatoryZones[key]
                    }
                })

            return foundRegulatoryZones
        }
    }

    function searchGears(searchText, regulatoryZones) {
        if (regulatoryZones && props.gears) {
            let foundRegulatoryZones = {...regulatoryZones}

            let uniqueGearCodes = getUniqueGearCodesFromSearch(searchText);

            Object.keys(foundRegulatoryZones)
                .forEach(key => {
                    foundRegulatoryZones[key] = foundRegulatoryZones[key]
                        .filter(zone => {
                            let gears = zone['gears']
                            if(gears) {
                                let gearsArray = gears.replace(/ /g, '').split(',')
                                let found = gearCodeIsFoundInRegulatoryZone(gearsArray, uniqueGearCodes)

                                return found || gears.toLowerCase().includes(searchText.toLowerCase())
                            } else {
                                return false
                            }
                        })

                    if (!foundRegulatoryZones[key] || !foundRegulatoryZones[key].length > 0) {
                        delete foundRegulatoryZones[key]
                    }
                })

            return foundRegulatoryZones
        } else {
            return {}
        }
    }

    function getUniqueGearCodesFromSearch(searchText) {
        let foundGearCodes = props.gears
            .filter(gear => gear.name.toLowerCase().includes(searchText.toLowerCase()))
            .map(gear => gear.code)
        return [...new Set(foundGearCodes)]
    }

    function gearCodeIsFoundInRegulatoryZone(gears, uniqueGearCodes) {
        return gears.some(gearCodeFromREG => {
            if (uniqueGearCodes.some(foundGearCode => foundGearCode === gearCodeFromREG)) {
                return true
            }
        });
    }

    return (
        <SearchBox showRegulatorySearchInput={props.showRegulatorySearchInput}>
            <SearchBoxField>
                <Label>Zone</Label>
                <SearchBoxInput
                    ref={input => props.showRegulatorySearchInput
                        && focusPlaceSearchText
                        && !gearSearchText
                        && !speciesSearchText
                        && !regulatoryReferencesSearchText ? input && input.focus() : null}
                    type="text"
                    value={placeSearchText}
                    placeholder={'Bretagne, Charente...'}
                    onChange={e => setPlaceSearchText(e.target.value)}/>
                <SearchIcon showRegulatorySearchInput={props.showRegulatorySearchInput}/>
            </SearchBoxField>
            <SearchBoxField>
                <Label>Engin</Label>
                <SearchBoxInput
                    type="text"
                    value={gearSearchText}
                    onClick={() => setFocusPlaceSearchText(false)}
                    placeholder={'chalut, OTB...'}
                    onChange={e => setGearSearchText(e.target.value)}/>
            </SearchBoxField>
            <SearchBoxField>
                <Label>Espèce</Label>
                <SearchBoxInput
                    type="text"
                    value={speciesSearchText}
                    onClick={() => setFocusPlaceSearchText(false)}
                    placeholder={'Bivalve, HKE...'}
                    onChange={e => setSpeciesSearchText(e.target.value)}/>
            </SearchBoxField>
            <SearchBoxField>
                <Label>Ref. reg.</Label>
                <SearchBoxInput
                    type="text"
                    value={regulatoryReferencesSearchText}
                    onClick={() => setFocusPlaceSearchText(false)}
                    placeholder={'2018-171...'}
                    onChange={e => setRegulatoryReferenceSearchText(e.target.value)}/>
            </SearchBoxField>
        </SearchBox>)
}

const SearchBox = styled.div`
  background: ${COLORS.background};
  top: 0.5em;
  z-index: 999999;
  color: ${COLORS.grayDarkerThree};
  text-decoration: none;
  border: none;
  border-radius: 0;
  text-align: center;
  margin: 0 0 0 0;
  overflow: hidden;
  height: 0;
  animation: ${props => props.showRegulatorySearchInput ? 'regulatory-input-opening' : 'regulatory-input-closing'} 0.5s ease forwards;

  @keyframes regulatory-input-opening {
    0%   { height: 40px;   }
    100% { height: 160px; }
  }

  @keyframes regulatory-input-closing {
    0%   { height: 120px; }
    100% { height: 0;   }
  }
`;

const SearchBoxField = styled.div`
  display: flex;
`

const Label = styled.div`
  width: 53px;
  height: 39px;
  background: ${COLORS.gray};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px ${COLORS.grayDarker} solid;
  flex: 0 0 64px;
  font-size: 13px;
  line-height: 2.9em;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: none;
  border-bottom: 1px ${COLORS.gray} solid;
  border-radius: 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 0.8em;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
  flex: 3;
  
  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`;

const SearchIcon = styled(SearchIconSVG)`
  opacity: ${props => props.showRegulatorySearchInput ? 1 : 0};
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayDarkerThree};
  cursor: pointer;
`

export default RegulatoryZoneSelectionSearchInput
