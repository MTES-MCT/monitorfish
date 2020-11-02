import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
import ReactCountryFlag from "react-country-flag"
import {ReactComponent as SearchIcon} from './icons/search.svg'
import LayersEnum from "../domain/enum";

const SearchBox = () => {
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
                        return - information
                    }
                    return information
                })
            }
        </>
    }

    return (
        <div className={`search-box`}>
            <SearchIcon className={'search-box-icon'}/>
            <input type="text" value={searchText} placeholder={'Chercher un CFR, Nom...'} onChange={e => setSearchText(e.target.value)}/>
            {
                foundShips && foundShips.length ? <div className={'search-box-results'}>
                    <ul>
                        {
                            foundShips.map((foundShip, index) => {
                                return <li
                                    onClick={() => setSelectedShip(foundShip)}
                                    key={index}>
                                    <b>{foundShip.getProperties().vesselName ? foundShip.getProperties().vesselName : 'SANS NOM'}</b>
                                    {foundShip.getProperties().flagState ? <ReactCountryFlag countryCode={foundShip.getProperties().flagState}
                                                                                             style={{float: 'right', marginTop: '0.5em'}}/> : null}
                                    <br/>
                                    {getShipInformation(foundShip)}
                                </li>
                            })
                        }
                    </ul>
                </div> : ''
            }

        </div>)
}

export default SearchBox
