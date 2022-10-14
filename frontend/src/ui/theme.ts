/* eslint-disable sort-keys-fix/sort-keys-fix */

export type Theme = typeof theme

// TODO Name and shades should absolutely match original UI
export const theme = {
  // https://xd.adobe.com/view/b6d4c472-3fbe-4dec-9f14-38fe03872a3e-e387/screen/b9bdc1ba-5f07-4c4f-bd44-2d38b2c6f663/specs/
  color: {
    /** INTERFACE COLORS */

    // Neutral Colors
    gunMetal: '#282F3E',
    charcoal: '#3B4559',
    slateGray: '#707785',
    lightGray: '#CCCFD6',
    gainsboro: '#E5E5EB',
    cultured: '#F7F7FA',
    white: '#FFFFFF',

    // Accentuation Colors
    blueYonder: {
      25: '#D4DDE7',
      100: '#567A9E'
    },
    blueGray: {
      100: '#5697D2',
      25: '#D4E5F4'
    },
    babyBlueEyes: '#99C9FF',

    // Notification Colors
    mediumSeaGreen: '#29B361',
    goldenPoppy: '#FAC11A',
    maximumRed: '#E1000F',

    /** CONTEXTUAL COLORS */

    // Risk Factor
    cadetGray: '#8E9A9F',
    grullo: '#B89B8C',
    copperRed: '#CF6A4E',
    chineseRed: '#A13112',

    // Beacon Malfunction
    powderBlue: '#9ED7D9',
    wheat: '#EDD6A4',
    // goldenPoppy: '#FAC11A',
    // maximumRed: '#E1000F',
    // charcoal: '#3B4559',
    // mediumSeaGreen: '#29B361',
    opal: '#A5BCC0',

    // Regulation Areas
    yaleBlue: '#295375',
    gaucous: '#6284A6',
    blueNcs: '#3690C0',
    iceberg: '#67A9CF',
    lightSteelBlue: '#9AB4D6',
    lightPeriwinkle: '#CDCFEA',
    aliceBlue: '#EBF0F4',
    lightCyan: '#C7EAE5',
    middleBlueGreen: '#91CFC9',
    verdigris: '#56B3AB',
    viridianGreen: '#01A29D',
    paoloVeroneseGreen: '#21977F',
    skobeloff: '#01686B',
    blueSapphire: '#01536A',
    indigoDye: '#033E54',
    lightCoral: '#FA8282',

    // TODO Remove all these colors which are not listed in the UI Design Library.
    blue: '#0A18DF',
    background: '#FFFFFF', // => `white`
    gray: '#EEEEEE',
    grayBackground: '#D3D5DC',
    grayDarkerTwo: '#9A9A9A',
    grayLighter: '#F0F0F0',
    grayShadow: '#969696BF',
    grayVesselHidden: '#B2B2B2',
    orange: '#F6D012',
    overlayShadow: '#7077851A',
    overlayShadowDarker: '#7077859A',
    shadowBlue: '#6B839E',
    shadowBlueLight: '#D6DCE3',
    shadowBlueLittleOpacity: 'rgba(107, 131, 158, 0.15)',
    slateGrayLittleOpacity: 'rgba(112, 119, 133, 0.7)',
    squareBorder: '#E0E0E0',
    textBueGray: '#848DAE',
    textWhite: '#EDEDF5',
    titleBottomBorder: '#E0E0E0',
    trackFishing: '#2A4670',
    trackTransit: '#1C9B7B',
    tumbleweed: '#F7BA9E',
    vegasGold: '#E8CA46',
    vesselColor: '#3B4559', // => `charcoal`
    vesselLightColor: '#CACCE0',
    yellowMunsell: '#F6D012'
  }
}
