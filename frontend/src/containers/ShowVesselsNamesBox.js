import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as ShowIconSVG} from "../components/icons/eye.svg";
import {ReactComponent as HideIconSVG} from "../components/icons/eye_not.svg";
import {useDispatch, useSelector} from "react-redux";
import {setVesselNamesShowedOnMap} from "../domain/reducers/Map";
import {COLORS} from "../constants/constants";

const ShowVesselsNamesBox = () => {
    const {vesselNamesShowedOnMap} = useSelector(state => state.map)
    const dispatch = useDispatch()
    const [_showVesselNames, setShowVesselNames] = useState(undefined);
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (firstUpdate.current) {
            setShowVesselNames(vesselNamesShowedOnMap)
            firstUpdate.current = false;
            return;
        }

        if (_showVesselNames !== vesselNamesShowedOnMap) {
            dispatch(setVesselNamesShowedOnMap(_showVesselNames))
        }
    }, [vesselNamesShowedOnMap, _showVesselNames])

    return (<Wrapper className={'ol-control'}>
        <Button onClick={() => setShowVesselNames(!_showVesselNames)} type="button" title={vesselNamesShowedOnMap ? 'Cacher les noms de navires' : 'Afficher les noms de navires'} data-bcup-haslogintext="no">
            <ButtonText>
                {vesselNamesShowedOnMap ? <HideIcon /> : <ShowIcon />}
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
  bottom: 8px;
  left: 39px;
  max-width: calc(100% - 1.3em);  
  background: none;
`

const Button = styled.button`
  float: left;
  background: ${COLORS.grayDarkerThree};
  
  :hover {
    background: ${COLORS.grayDarkerThree};
  }
`

const ButtonText = styled.span`
  font-size: 0.8em;
`

export default ShowVesselsNamesBox
