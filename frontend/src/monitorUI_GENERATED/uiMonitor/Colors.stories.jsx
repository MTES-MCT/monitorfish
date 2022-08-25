import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../constants/constants';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ColorSample = styled.div`
  width: 120px;
  height: 120px;
  margin: 5px;
  display: inline-block;
  background-color: ${props=>props.color};
  border: 1px solid black;
`


export default {
  title: 'Monitor/Colors',
  component: ColorSample,
};

const Template = () => {
 return <Wrapper>
 {Object.entries(COLORS).map(([key, value])=>{
   console.log(value)
   return <ColorSample key={key} color={value} >{key}</ColorSample>
  })}
 </Wrapper>
}

export const Primary = Template.bind({});
