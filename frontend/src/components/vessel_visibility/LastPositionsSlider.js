import React, {useEffect, useState} from "react";
import { RangeSlider } from 'rsuite';
import styled from "styled-components";
import Nouislider from "nouislider-react";

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

    function updateValue(nextValue) {
        if (nextValue[0] !== value[0] || nextValue[1] !== value[1]) {
            nextValue = [
                parseInt(nextValue[0]),
                parseInt(nextValue[1])
            ]
            setValue(nextValue)
            props.updateVesselsLastPositionVisibility(labels[nextValue[0]], labels[nextValue[1]])
        }
    }

    return (
        <>
            { value ?
                <SliderWrapper>
                    <Nouislider
                        range={{
                            min: [0, 1],
                            max: [6]
                        }}
                        start={value}
                        connect={[true, true, true]}
                        onSlide={(render, handle, nextValue) => updateValue(nextValue)}
                        behaviour="tap"
                    />
                    <RangeSlider
                        min={0}
                        max={labels.length - 1}
                        value={value}
                        defaultValue={value}
                        graduated
                        tooltip={false}
                        onChange={nextValue => updateValue(nextValue)}
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
  height: 30px;
  font-size: 13px;
  position: relative;
`

export default LastPositionsSlider
