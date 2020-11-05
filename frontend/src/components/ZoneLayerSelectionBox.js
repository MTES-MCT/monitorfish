import React from "react";
import RegulatoryLayerControl from "./layers-control/RegulatoryLayerControl";

const ZoneLayerSelectionBox = props => {
    return (
        <div className={`layer-selection-box`}>
            <span className={'layer-selection-box-title'}>ZONES</span>
            <ul>
                {
                    props.layers.map((layer, index) => {
                        return (<li className='layer-button' key={index}>{layer}</li>)
                    })
                }
            </ul>
        </div>
    )
}

export default ZoneLayerSelectionBox
