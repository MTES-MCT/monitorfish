import React, {useContext, useEffect, useRef, useState} from "react";
import styled from 'styled-components';

import {Context} from "../Store";
import ReactCountryFlag from "react-country-flag"
import {ReactComponent as SearchIconSVG} from './icons/search.svg'
import LayersEnum from "../domain/layers";

const ShipsSearchBox = () => {
    const [state, dispatch] = useContext(Context)
    const [searchText, setSearchText] = useState('');
    const [foundShips, setFoundShips] = useState([]);
    const [selectedShip, setSelectedShip] = useState(null);

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
            state.layer.layers
                .filter(layer => layer.className_ === LayersEnum.SHIPS)
                .forEach(shipsLayer => {
                    let ships = shipsLayer.getSource().getFeatures().map(feature => {
                        if (findMatchingFeature(feature)) {
                            return feature
                        }
                    }).filter(ship => ship)

                    setFoundShips(ships)
                })
        } else {
            setFoundShips([])
        }
    }, [searchText, setFoundShips])

    useEffect(() => {
        if (selectedShip) {
            dispatch({type: 'ANIMATE_TO_SHIP', payload: selectedShip});
            dispatch({type: 'SHOW_SHIP_TRACK', payload: selectedShip});
            setFoundShips([])
            setSearchText('')
        }
    }, [selectedShip])

    function getShipInformation(foundShip) {
        const informationList = Array.of(
            foundShip.getProperties().internalReferenceNumber,
            foundShip.getProperties().externalReferenceNumber,
            foundShip.getProperties().MMSI
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
                foundShips && foundShips.length ? <Results>
                    <List>
                        {
                            foundShips.map((foundShip, index) => {
                                return (
                                    <ListItem
                                        onClick={() => setSelectedShip(foundShip)}
                                        key={index}>
                                        <b>{foundShip.getProperties().vesselName ? foundShip.getProperties().vesselName : 'SANS NOM'}</b>
                                        {foundShip.getProperties().flagState ?
                                            <ReactCountryFlag countryCode={foundShip.getProperties().flagState}
                                                              style={{float: 'right', marginTop: '0.5em'}}/> : null}
                                        <br/>
                                        {getShipInformation(foundShip)}
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
  background-color: rgba(255,255,255,0.4);
  border-radius: 4px;
  padding: 3px 3px 3px 3px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
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


export default ShipsSearchBox
