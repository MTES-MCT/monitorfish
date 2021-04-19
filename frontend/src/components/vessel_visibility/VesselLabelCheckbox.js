import React, {useEffect, useState} from "react";
import {Checkbox} from 'rsuite';
import styled from "styled-components";

const VesselLabelCheckbox = props => {
    const [value, setValue] = useState(undefined)

    useEffect(() => {
        if(props.vesselLabelsShowedOnMap !== undefined && value === undefined) {
            setValue(props.vesselLabelsShowedOnMap)
        }
    }, [props.vesselLabelsShowedOnMap])

    return (
        <>
            { value !== undefined ?
                <RadioWrapper>
                    <Checkbox
                        checked={value}
                        onChange={(value, isChecked) => {
                            props.updateVesselLabelsShowedOnMap(isChecked)
                            setValue(isChecked)
                        }}

                    >{' '} <ShowLabelText>Afficher les étiquettes des navires</ShowLabelText></Checkbox>
                </RadioWrapper> : null
            }
        </>
    );
}

const ShowLabelText = styled.span`
  margin-left: 0;
  color: #969696;
`

const RadioWrapper = styled.div`
  padding: 0px 0 0 4px;
  font-size: 13px;
  text-align: left;
`

export default VesselLabelCheckbox
