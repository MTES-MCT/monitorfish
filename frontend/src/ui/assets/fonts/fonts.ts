import { createGlobalStyle } from 'styled-components'

// @ts-ignore
import MarianneBold from './Marianne/Marianne-Bold.woff2'
// @ts-ignore
import MarianneBoldItalic from './Marianne/Marianne-Bold_Italic.woff2'
// @ts-ignore
import MarianneLight from './Marianne/Marianne-Light.woff2'
// @ts-ignore
import MarianneLightItalic from './Marianne/Marianne-Light_Italic.woff2'
// @ts-ignore
import MarianneMedium from './Marianne/Marianne-Medium.woff2'
// @ts-ignore
import MarianneMediumItalic from './Marianne/Marianne-Medium_Italic.woff2'
// @ts-ignore
import MarianneRegular from './Marianne/Marianne-Regular.woff2'
// @ts-ignore
import MarianneItalic from './Marianne/Marianne-Regular_Italic.woff2'

export const FontStyle = createGlobalStyle`
    @font-face {
      font-family: Marianne;
      src: local('Marianne'), local('Marianne-Regular'), url(${MarianneRegular}) format('woff2');
      font-weight: normal;
    }

     @font-face {
      font-family: Marianne;
      src: local('Marianne-Thin'), url(${MarianneLight}) format('woff2');
      font-weight: 300;
    }

    @font-face {
      font-family: Marianne;
      src:local('Marianne-Medium'), url(${MarianneMedium}) format('woff2');
      font-weight: 500;
    }

    @font-face {
      font-family: Marianne;
      src: local('Marianne-Medium_Italic'), url(${MarianneMediumItalic}) format('woff2');
      font-weight: 500;
      font-style: italic;
    }

    @font-face {
      font-family: Marianne;
      src: local('Marianne-Thin_Italic'), url(${MarianneLightItalic}) format('woff2');
      font-weight: lighter;
      font-style: italic;
    }

    @font-face {
      font-family: Marianne;
      src:local('Marianne-Regular_Italic'), url(${MarianneItalic}) format('woff2');
      font-weight: normal;
      font-style: italic;
    }

     @font-face {
      font-family: Marianne;
      src: local('Marianne-Bold'), url(${MarianneBold}) format('woff2');
      font-weight: 700;
    }

     @font-face {
      font-family: Marianne;
      src: local('Marianne-Bold_Italic'), url(${MarianneBoldItalic}) format('woff2');
      font-style: italic;
      font-weight: 700;
    }
  `
