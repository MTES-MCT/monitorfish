import { ReactComponent as Download } from '../../features/icons/standardized/Download.svg'

import type { IconName } from './constants'
import type { FunctionComponent, SVGProps } from 'react'

export const Icon: Record<IconName, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  Download
}
