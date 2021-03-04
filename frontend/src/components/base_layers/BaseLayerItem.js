import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {baseLayers} from "../../domain/entities/layers";
import {Radio} from "rsuite";

const BaseLayerItem = props => {
    const firstUpdate = useRef(true);
    const [showLayer_, setShowLayer] = useState(undefined);

    useEffect(() => {
        if (showLayer_ === undefined) {
            setShowLayer(props.isShownOnInit)
        }
    }, [props.isShownOnInit, showLayer_])

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer_) {
            props.callSelectBaseLayer(baseLayers[props.layer].code)
        }
    }, [showLayer_])

    return <>
        {props.layer ?
            <Row
                className={`base-layers-selection`}
            >
                    <Radio
                        onChange={() => {
                            props.callSelectBaseLayer(baseLayers[props.layer].code)
                        }}
                        checked={props.isShownOnInit}
                        value={props.layer}>
                        {baseLayers[props.layer].text}
                    </Radio>

            </Row> : null
        }
        </>
}

const Row = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  padding-left: 10px;
  user-select: none;
`

export default BaseLayerItem
