import React, {useContext, useEffect, useState} from "react";
import {getAllRegulatoryLayerNames} from "../api/fetch";
import {Context} from "../Store";
import RegulatoryLayerControl from "./layers-control/RegulatoryLayerControl";
import RegulatoryLayerSearchBox from "./layers-control/RegulatoryLayerSearchBox";

const RegulatoryLayerSelectionBox = () => {
    const [_, dispatch] = useContext(Context)
    const [layerNames, setLayerNames] = useState([]);
    const [foundLayerNames, setFoundLayerNames] = useState([]);

    useEffect(() => {
        getAllRegulatoryLayerNames(dispatch)
            .then(layerNames => setLayerNames(layerNames))
    }, [])

    return (
        layerNames && layerNames.length > 0 ? <div className={`regulatory-layer-selection-box`}>
            <span className={'regulatory-layer-selection-box-title'}>REGLEMENTATION</span>
            <RegulatoryLayerSearchBox layerNames={layerNames} setFoundLayerNames={setFoundLayerNames}/>
            <ul>
                {
                    foundLayerNames.length > 0 ? foundLayerNames.map((layer, index) => {
                    return (<li className='regulatory-layer-button' key={index}><RegulatoryLayerControl layerName={layer}/></li>)
                }) : layerNames.map((layer, index) => {
                        return (<li className='regulatory-layer-button' key={index}><RegulatoryLayerControl layerName={layer}/></li>)
                    })
                }
            </ul>
        </div> : null
    )
}

export default RegulatoryLayerSelectionBox
