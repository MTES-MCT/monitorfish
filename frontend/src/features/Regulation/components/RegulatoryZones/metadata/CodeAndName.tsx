import { Label } from './RegulatoryMetadata.style'
import { COLORS } from '../../../../../constants/constants'
import { InfoPoint } from '../../../../Backoffice/edit_regulation/InfoPoint'

import type { Gear } from '../../../../../domain/types/Gear'

export type CodeAndNameProps = {
  categoriesToGears?: Record<string, Gear[]> | undefined
  code: string | undefined
  isCategory?: boolean
  name: string
}
export function CodeAndName({ categoriesToGears, code, isCategory = false, name }: CodeAndNameProps) {
  const title = categoriesToGears
    ? (categoriesToGears[name] || [])
        .map(gear => `${gear.code} - ${gear.name} \n`)
        .toString()
        .replace(/,/g, '')
    : undefined

  return (
    <Label>
      {`${code ? `${code} ${name ? `(${name})` : ''}` : `${name ? `${name}` : ''}`}`}
      {isCategory && categoriesToGears && categoriesToGears[name] && (
        <InfoPoint
          backgroundColor={COLORS.charcoal}
          dataCy="regulatory-layers-metadata-gears-category-with-infobox"
          margin="3px"
          title={title}
        />
      )}
    </Label>
  )
}
