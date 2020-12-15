import React, {useEffect, useState} from "react";
import styled from 'styled-components';

const RegulatoryZoneSelectionSearchInput = props => {
    const [placeSearchText, setPlaceSearchText] = useState('');
    const [gearSearchText, setGearSearchText] = useState('');
    const [speciesSearchText, setSpeciesSearchText] = useState('');
    const [regulatoryReferenceSearchText, setRegulatoryReferenceSearchText] = useState('');

    const searchFields = {
        "placeSearchText": {
            "searchText": placeSearchText,
            "properties": ['layerName', 'zone']
        },
        "gearSearchText": {
            "searchText": gearSearchText,
            "properties": ['gears']
        },
        "speciesSearchText": {
            "searchText": speciesSearchText,
            "properties": ['species']
        },
        "regulatoryReferenceSearchText": {
            "searchText": regulatoryReferenceSearchText,
            "properties": ['regulatoryReference']
        }
    }

    useEffect(() => {
        if(placeSearchText.length < 1 &&
            gearSearchText.length < 1 &&
            regulatoryReferenceSearchText.length < 1 &&
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

    }, [speciesSearchText, gearSearchText, placeSearchText, regulatoryReferenceSearchText])

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
                            return propertiesToSearch.length === 1
                                ? zone[propertiesToSearch[0]] ? zone[propertiesToSearch[0]].toLowerCase().includes(searchText.toLowerCase()) : false
                                : (zone[propertiesToSearch[0]] ? zone[propertiesToSearch[0]].toLowerCase().includes(searchText.toLowerCase()) : false) ||
                                (zone[propertiesToSearch[1]] ? zone[propertiesToSearch[1]].toLowerCase().includes(searchText.toLowerCase()) : false)
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
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Zone (ex. Bretagne, Charente...)'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={gearSearchText} placeholder={'Engin (ex. chalut, OTB...)'} onChange={e => setGearSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={speciesSearchText} placeholder={'Espèce (ex. Bivalve, HKE...)'} onChange={e => setSpeciesSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={regulatoryReferenceSearchText} placeholder={'Réglementation (ex. 2018-171)'} onChange={e => setRegulatoryReferenceSearchText(e.target.value)}/>
        </SearchBox>)
}

const SearchBox = styled.div`
  top: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 0;
  text-align: center;
  margin: 0 0 0 0;
  overflow: hidden;
  height: 0;
  animation: ${props => props.showRegulatorySearchInput ? 'regulatory-input-opening' : 'regulatory-input-closing'} 1s ease forwards;

  @keyframes regulatory-input-opening {
    0%   { height: 0;   }
    100% { height: 104px; }
  }

  @keyframes regulatory-input-closing {
    0%   { height: 104px; }
    100% { height: 0;   }
  }
`;

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  background-color: rgba(255,255,255,0.1);
  border: none;
  border-bottom: 1px #8080802b solid;
  border-radius: 0;
  color: white;
  font-size: 0.8em;
  height: 25px;
  width: 100%;
  padding: 0 5px 0 5px;
`;

export default RegulatoryZoneSelectionSearchInput
