import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
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
        if (searchText.length > 2) {
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

    return (
        <div className={`search-box`}>
            <SearchIcon className={'search-box-icon'}/>
            <input type="text" value={searchText} placeholder={'Chercher un CFR, MMSI...'} onChange={e => setSearchText(e.target.value)}/>
            {
                foundShips && foundShips.length ? <div className={'search-box-results'}>
                    <ul>
                        {
                            foundShips.map(foundShip => {
                                return <li
                                    onClick={() => setSelectedShip(foundShip)}
                                    key={foundShip.getProperties().internalReferenceNumber-foundShip.getProperties().externalReferenceNumber}>
                                    <b>{foundShip.getProperties().vesselName ? foundShip.getProperties().vesselName : 'SANS NOM'}</b><br/>
                                    {foundShip.getProperties().internalReferenceNumber} - {foundShip.getProperties().externalReferenceNumber}
                                </li>
                            })
                        }
                    </ul>
                </div> : ''
            }

        </div>)
}

export default SearchBox
