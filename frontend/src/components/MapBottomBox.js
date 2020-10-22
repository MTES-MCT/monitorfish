import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../state/Store";
import Layers from "../layers/LayersEnum"

const MapBottomBox = props => {
    return (<span className={`coordinates-box`}>{props.coordinates}</span>)
}

export default MapBottomBox
