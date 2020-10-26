import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
import Layers from "../domain/LayersEnum"

const EEZControl = () => {
    const [_, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer) {
            dispatch({type: 'SHOW_LAYER', payload: Layers.EEZ});
        } else {
            dispatch({type: 'HIDE_LAYER', payload: Layers.EEZ});
        }
    }, [showLayer])

    return (<span className={`ol-unselectable ol-control button eez-control`} onClick={() => setShowLayer(!showLayer)}>EEZ</span>)
}

export default EEZControl
