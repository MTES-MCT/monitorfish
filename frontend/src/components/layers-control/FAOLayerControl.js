import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../../Store";
import Layers from "../../domain/enum"
import {ReactComponent as ShowIcon} from '../icons/eye.svg'
import {ReactComponent as HideIcon} from '../icons/eye_not.svg'

const FAOLayerControl = () => {
    const [_, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer) {
            console.log('SHOW_LAYER')
            dispatch({type: 'SHOW_LAYER', payload: { type: Layers.FAO }});
        } else {
            console.log('HIDE_LAYER')
            dispatch({type: 'HIDE_LAYER', payload: { type: Layers.FAO }});
        }
    }, [showLayer])

    return (<span onClick={() => setShowLayer(!showLayer)}>FAO { showLayer ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</span>)
}

export default FAOLayerControl
