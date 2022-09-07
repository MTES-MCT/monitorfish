/**
 * @see https://styled-components.com/docs/api#create-a-declarations-file
 */

import 'styled-components'

import type { Theme } from './theme'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
