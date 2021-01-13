import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import {COLORS} from "../constants/constants";
import {getHash} from "../utils";
import {getGearCategory} from "../domain/use_cases/showLayer";
import {getVectorLayerStyle} from "../layers/styles/vectorLayerStyles";
import Layers from "../domain/entities/layers";

const LayerDetailsBox = props => {
    const [vectorLayerStyle, setVectorLayerStyle] = useState(null)

    useEffect(() => {
        if(props.regulatory && props.regulatory.getProperties().zones && props.regulatory.getProperties().layer_name && props.regulatory.getProperties().engins && props.gears) {
            let hash = getHash(`${props.regulatory.getProperties().layer_name}:${props.regulatory.getProperties().zones}`)
            let gearCategory = getGearCategory(props.regulatory.getProperties().engins, props.gears);
            setVectorLayerStyle(getVectorLayerStyle(Layers.REGULATORY)(null, hash, gearCategory))
        }
    }, [props.regulatory, props.gears])

    return (<Details>
        {
            props.regulatory ? <>
                <Rectangle vectorLayerStyle={vectorLayerStyle} />
                <Text>
                    {props.regulatory.getProperties().layer_name.replace(/[_]/g, ' ')}
                    {
                        props.regulatory.getProperties().zones ?
                            <ZoneName>{props.regulatory.getProperties().zones.replace(/[_]/g, ' ')}</ZoneName> : null
                    }
                </Text>
            </> : null
        }
    </Details>)
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 7px;
  margin-top: 3px;
`

const Text = styled.span`
  display: inline-block;
  vertical-align: text-bottom;
`

const Details = styled.span`
  position: absolute;
  bottom: 10px;
  left: 272px;
  display: inline-block;
  margin: 1px;
  padding: 1px 10px 1px 10px;
  text-decoration: none;
  text-align: center;
  height: 23px;
  border: none;
  border-radius: 2px;
  background: ${COLORS.grayBackground};
  font-size: 13px;
  font-weight: 500;
  color: ${COLORS.grayDarkerThree}
`

const ZoneName = styled.span`
  font-weight: 400;
  color: ${COLORS.grayDarkerTwo}
  font-size: 13px;
  margin-left: 10px;
`

export default LayerDetailsBox
