import { createGlobalStyle } from 'styled-components'

import MarianneRegular from './Marianne/Marianne-Regular.woff2'
import MarianneMedium from './Marianne/Marianne-Medium.woff2'
import MarianneMediumItalic from './Marianne/Marianne-Medium_Italic.woff2'
import MarianneLight from './Marianne/Marianne-Light.woff2'
import MarianneLightItalic from './Marianne/Marianne-Light_Italic.woff2'
import MarianneBold from './Marianne/Marianne-Bold.woff2'
import MarianneBoldItalic from './Marianne/Marianne-Bold_Italic.woff2'
import MarianneItalic from './Marianne/Marianne-Regular_Italic.woff2'

export default createGlobalStyle`
    @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Regular'), url(${MarianneRegular}) format('woff');
      font-weight: normal;  
    }
    
     @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Thin'), url(${MarianneLight}) format('woff');
      font-weight: 300;
    }
    
    @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Medium'), url(${MarianneMedium}) format('woff');
      font-weight: 500;  
    }
    
    @font-face {
      font-family: Marianne;
      src:  local('Marianne'), local('Marianne-Medium_Italic'), url(${MarianneMediumItalic}) format('woff');
      font-weight: 500;  
      font-style: italic;
    }
    
    @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Thin_Italic'), url(${MarianneLightItalic}) format('woff');
      font-weight: lighter;
      font-style: italic;
    }
    
    @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Regular_Italic'), url(${MarianneItalic}) format('woff');
      font-weight: normal;  
      font-style: italic;
    }
     
     @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Bold'), url(${MarianneBold}) format('woff');
      font-weight: bold;  
    }
     
     @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Bold_Italic'), url(${MarianneBoldItalic}) format('woff');
      font-style: italic;
      font-weight: bold;
    }
  `
