import React from "react";
import styled from 'styled-components';
import {COLORS} from "../constants/constants";

const MapCoordinatesBox = props => {
    return (<Coordinates>{props.coordinates}</Coordinates>)
}

const Coordinates = styled.span`
  position: absolute;
  bottom: 10px;
  left: 72px;
  display: inline-block;
  margin: 1px;
  padding: 2px 0 5px 2px;
  color: ${COLORS.textWhite};
  font-size: 0.9em;
  text-decoration: none;
  text-align: center;
  height: 1.275em;
  background-color: ${COLORS.grayDarkerThree};
  border: none;
  border-radius: 2px;
  width: 190px;
`

export default MapCoordinatesBox
