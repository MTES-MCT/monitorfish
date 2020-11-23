import React, {useContext, useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ShowIconSVG} from "./icons/eye.svg";
import {ReactComponent as HideIconSVG} from "./icons/eye_not.svg";
import {Context} from "../Store";

const ShowVesselsNamesBox = () => {
    const [state, dispatch] = useContext(Context)
    const [showVesselNames, setShowVesselNames] = useState(undefined);
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (firstUpdate.current) {
            setShowVesselNames(state.vessel.showVesselNames)
            firstUpdate.current = false;
            return;
        }

        if (showVesselNames !== state.vessel.showVesselNames) {
            dispatch({type: 'SHOW_VESSEL_NAMES', payload: showVesselNames});
        }
    }, [state.vessel.showVesselNames, showVesselNames])

    return (<Wrapper className={'ol-control'}>
        <Button onClick={() => setShowVesselNames(!showVesselNames)} type="button" title={state.vessel.showVesselNames ? 'Cacher les noms de navires' : 'Afficher les noms de navires'} data-bcup-haslogintext="no">
            <ButtonText>
                {state.vessel.showVesselNames ? <HideIcon /> : <ShowIcon />}
            </ButtonText>
        </Button>
    </Wrapper>)
}

const ShowIcon = styled(ShowIconSVG)`
  margin-bottom: -5px;
  width: 20px;
  height: 20px;
`

const HideIcon = styled(HideIconSVG)`
  margin-bottom: -5px;
  width: 20px;
  height: 20px;
`

const Wrapper = styled.div`
  bottom: 6.2em;
  left: .5em;
  max-width: calc(100% - 1.3em);  
  background: none;
`

const Button = styled.button`
  float: left;
  
  :hover {
    background: none;
  }
`

const ButtonText = styled.span`
  font-size: 0.8em;
`

export default ShowVesselsNamesBox
