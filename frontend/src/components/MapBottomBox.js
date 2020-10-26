import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
import Layers from "../domain/LayersEnum"

const MapBottomBox = props => {
    return (<span className={`coordinates-box`}>{props.coordinates}</span>)
}

export default MapBottomBox
