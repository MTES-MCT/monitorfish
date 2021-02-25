import React, {useEffect, useState} from "react";
import { RangeSlider } from 'rsuite';
import styled from "styled-components";

const LastPositionsSlider = props => {
    const [value, setValue] = useState(null)
    // Hours
    const labels = [48, 24, 12, 6, 3, 2, 1];

    useEffect(() => {
        if(props.vesselsLastPositionVisibility && !value) {
            let opacityReducedIndex = labels.findIndex(label => props.vesselsLastPositionVisibility.opacityReduced === label)
            let hiddenIndex = labels.findIndex(label => props.vesselsLastPositionVisibility.hidden === label)
            setValue([hiddenIndex, opacityReducedIndex])
        }
    }, [props.vesselsLastPositionVisibility])

    return (
        <>
            { value ?
                <SliderWrapper>
                    <RangeSlider
                        min={0}
                        max={labels.length - 1}
                        value={value}
                        defaultValue={value}
                        graduated
                        tooltip={false}
                        onChange={v => {
                            setValue(v)
                            props.updateVesselsLastPositionVisibility(labels[v[0]], labels[v[1]])
                        }}
                        renderMark={mark => {
                            switch (mark) {
                                case 0: return '48h'
                                case 1: return '24h'
                                case 2: return '12h'
                                case 3: return '6h'
                                case 4: return '3h'
                                case 5: return '2h'
                                case 6: return '1h'
                                default: return null
                            }
                        }}
                    />
                </SliderWrapper> : null
            }
        </>
    );
}

const SliderWrapper = styled.div`
  padding: 2px 35px 15px 30px;
  font-size: 13px;
`

export default LastPositionsSlider
