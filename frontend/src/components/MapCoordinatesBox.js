import React from "react";
import styled from 'styled-components';

const MapCoordinatesBox = props => {
    return (<Coordinates>{props.coordinates}</Coordinates>)
}

const Coordinates = styled.span`
  position: absolute;
  bottom: 10px;
  left: 42px;
  display: inline-block;
  margin: 1px;
  padding: 2px 0 5px 2px;
  color: white;
  font-size: 0.9em;
  text-decoration: none;
  text-align: center;
  height: 1.275em;
  background-color: #05055E;
  border: none;
  border-radius: 2px;
  width: 190px;
`

export default MapCoordinatesBox
