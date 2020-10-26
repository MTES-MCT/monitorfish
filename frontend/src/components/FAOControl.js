import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
import Layers from "../domain/LayersEnum"

const FAOControl = () => {
    const [_, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer) {
            dispatch({type: 'SHOW_LAYER', payload: Layers.FAO});
        } else {
            dispatch({type: 'HIDE_LAYER', payload: Layers.FAO});
        }
    }, [showLayer])

    return (<span className={`ol-unselectable ol-control button fao-control`} onClick={() => setShowLayer(!showLayer)}>CIAM</span>)
}

export default FAOControl
