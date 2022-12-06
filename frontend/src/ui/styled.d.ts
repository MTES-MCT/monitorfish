/**
 * @see https://styled-components.com/docs/api#create-a-declarations-file
 */

import type { Theme } from '@mtes-mct/monitor-ui'
import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
