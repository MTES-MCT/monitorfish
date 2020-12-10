import React, {useEffect, useState} from "react";
import styled from 'styled-components';

import ReactCountryFlag from "react-country-flag"
import {ReactComponent as SearchIconSVG} from '../components/icons/search.svg'
import LayersEnum from "../domain/layers";
import showVesselTrackAndSummary from "../use_cases/showVesselTrackAndSummary";
import {useDispatch, useSelector} from "react-redux";

const VesselsSearchBox = () => {
    const layers = useSelector(state => state.layer.layers)
    const dispatch = useDispatch()

    const [searchText, setSearchText] = useState('');
    const [foundVessels, setFoundVessels] = useState([]);
    const [selectedVessel, setSelectedVessel] = useState(null);

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
        if (selectedVessel) {
            dispatch(showVesselTrackAndSummary(selectedVessel.getProperties().internalReferenceNumber, selectedVessel, true));
            setFoundVessels([])
            setSearchText('')
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
        <Wrapper>
            <SearchIcon/>
            <Input type="text" value={searchText} placeholder={'Chercher un CFR, Nom...'}
                   onChange={e => setSearchText(e.target.value)}/>
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

const Wrapper = styled.div`
  position: absolute;
  display: inline-block;
  top: 0.5em;
  right: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 3px 3px 3px 3px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  
  :hover {
    background-color: rgba(255,255,255,0.2);
  }
`;

const Results = styled.div`
  background: white;
  color: #05055E;
`;

const Input = styled.input`
  margin: 0;
  background-color: #05055E;
  border: none;
  border-radius: 2px;
  color: white;
  padding: 3px;
  font-size: 0.8em;
  height: 25px;
`;

const SearchIcon = styled(SearchIconSVG)`
  margin-bottom: -8px;
  margin-right: -2px;
  border-radius: 2px;
  width: 25px;
  height: 25px;
  background-color: #05055E;
`

const List = styled.ul`
  margin: 0;
  border-radius: 2px;
  padding: 3px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 200px;
`

const ListItem = styled.li`
  padding: 2px 5px 2px 5px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  border-bottom: #E2E2E9 1px solid;
`


export default VesselsSearchBox
