import React, {useState, useEffect, useRef, useContext} from 'react';

import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import {transform} from 'ol/proj'
import {Context} from "../state/Store";
import Layers from "./LayersEnum";

const THIRTY_SECONDS = 30000;

const ShipsLayer = () => {
    const [state, dispatch] = useContext(Context)
    const [ships, setShips] = useState({})

    function getShips() {
        fetch('/bff/v1/positions')
            .then(response => response.json())
            .then(ships => {
                setShips(ships)
            })
            .catch(error => {
                dispatch({type: 'SET_ERROR', payload: error});
            });
    }

    useEffect( () => {
        // create and add vector source layer
        const initialShipsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.SHIPS
        })
        dispatch({type: 'SET_LAYERS', payload: [initialShipsLayer]});

        getShips()
        setInterval(() => {
            getShips()
        }, THIRTY_SECONDS)
    },[])

    useEffect( () => {
        if (ships.length && state.layers) {
            let shipsFeatures = ships.map(ship => {
                // transform coord to EPSG 4326 standard Lat Long
                const transformedCoordinates = transform([ship.longitude, ship.latitude], 'EPSG:4326', 'EPSG:3857')

                const iconFeature = new Feature({
                    geometry: new Point(transformedCoordinates),
                    name: ship.internalReferenceNumber || ship.mmsi,
                });

                setShipIconStyle(ship, iconFeature);

                return iconFeature;
            })

            state.layers
                .filter(layer => layer.className_ === Layers.SHIPS)
                .map(layer => {
                    layer.setSource(
                        new VectorSource({
                            features: shipsFeatures
                        })
                    )
                    dispatch({type: 'REPLACE_SHIPS_LAYER', payload: layer})
                    dispatch({type: 'SHOW_LAYER', payload: Layers.SHIPS});
                });
        }
    },[ships])

    const setShipIconStyle = (ship, iconFeature) => {
        const shipDate = new Date(ship.dateTime);
        const nowMinusTwoHours = new Date();
        nowMinusTwoHours.setHours(nowMinusTwoHours.getHours() - 3);

        const iconStyle = new Style({
            image: new Icon({
                src: 'boat.png',
                offset: [0, 0],
                imgSize: [20, 20],
                rotation: ship.course,
                opacity: shipDate < nowMinusTwoHours ? 0.5 : 1
            }),
        });
        iconFeature.setStyle(iconStyle);
    }

    return null
}

export default ShipsLayer
