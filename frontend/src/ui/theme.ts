/* eslint-disable sort-keys-fix/sort-keys-fix */

export type Theme = typeof theme

// TODO Name and shades should absolutely match original UI
export const theme = {
  // https://xd.adobe.com/view/b6d4c472-3fbe-4dec-9f14-38fe03872a3e-e387/screen/b9bdc1ba-5f07-4c4f-bd44-2d38b2c6f663/specs/
  color: {
    /** INTERFACE COLORS */

    // Neutral Colors
    gunMetal: '#282F3E',
    // TODO Make that charcoal object 100 & 50
    charcoal: '#3B4559',
    charcoalShadow: 'rgba(59, 69, 89, 0.5)',
    slateGray: '#707785',
    lightGray: '#CCCFD6',
    gainsboro: '#E5E5EB',
    cultured: '#F7F7FA',
    white: '#FFFFFF',

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

    // Vessel Track
    darkCornflowerBlue: '#2A4670',
    jungleGreen: '#1C9B7B',

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
    queenBlue: '#367096',
    glaucous: '#6284A6',
    blueNcs: '#3690C0',
    iceberg: '#67A9CF',
    lightSteelBlue: '#9AB4D6',
    lightPeriwinkle: '#CDCFEA',
    aliceBlue: '#EBF0F4',
    lightBlue: '#B9DDE5',
    skyBlue: '#77C1DE',
    frenchBlue: '#2E75AB',
    prussianBlue: '#003454',
    lightCoral: '#FA8282',

    // TODO Remove this color.
    blue: '#0A18DF' // => `???`

    // TODO Remove all these colors which are not listed in the UI Design Library.
    // These colors are still here because we they still exists as hard-coded hex in the code.
    // background: '#FFFFFF', // => `white`
    // gray: '#EEEEEE', // => `lightGray`
    // grayLighter: '#F0F0F0', // => `gainsboro`
    // orange: '#F6D012', // => `goldenPoppy`
    // Red button in alert list menu to silence an alert
    // overlayShadowDarker: '#7077859A', // => `charcoalShadow`
    // Dotted line when there is a big "hole" between 2 last VMS positions
    // + Estimated position line
    // squareBorder: '#E0E0E0', // => `lighGray`
    // Table cell fleet segment when it's unknown ("inconnu" text color) / Control Objective
    // vesselColor: '#3B4559', // => `charcoal`
    // Vessel color when on a dark map
    // Warning message backgrounds
    // yellowMunsell: '#F6D012' // => `goldenPoppy`
  }
}
