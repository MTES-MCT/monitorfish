import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../constants/constants';

const reqSvgs = require.context('../icons', true, /\.svg$/)

export default {
  title: 'Monitor/Icons',
};


const Template = ({background, color}) => {
  return <Gallery>
  {
    reqSvgs.keys().map((path)=>{
      return <ImageWrapper key={path}>
          <Img src={reqSvgs(path)} background={background} color={color}></Img>
          {path}
          </ImageWrapper>
    }) 
  }
  </Gallery>
 }
 
 export const NoBackground = Template.bind({});
 export const WithBackground = Template.bind({});
 WithBackground.args = {
  background: COLORS.charcoal,
  color: 'white'
 }


 const Img = styled.img`
  background: ${({background}) => background || COLORS.white};
  color: ${({color}) => color || COLORS.charcoal};
  width: 50px;
  margin: 3px;
 `
const ImageWrapper = styled.div``

const Gallery = styled.div`
 height: 100%;
 overflow: auto;
`