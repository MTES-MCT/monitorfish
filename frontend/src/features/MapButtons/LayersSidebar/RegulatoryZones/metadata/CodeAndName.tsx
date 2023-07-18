// TODO Remove temporary `any`, `as any` and `@ts-ignore` (fresh migration to TS).

import { Label } from './RegulatoryMetadata.style'
import { COLORS } from '../../../../../constants/constants'
import { InfoPoint } from '../../../../Backoffice/edit_regulation/InfoPoint'

export type CodeAndNameProps = {
  categoriesToGears?: any
  code: string
  isCategory?: boolean
  name: string
}
export function CodeAndName({ categoriesToGears, code, isCategory = false, name }: CodeAndNameProps) {
  return (
    <Label>
      {`${code ? `${code} ${name ? `(${name})` : ''}` : `${name ? `${name}` : ''}`}`}
      {isCategory && categoriesToGears && categoriesToGears[name] && (
        <InfoPoint
          backgroundColor={COLORS.charcoal}
          dataCy="regulatory-layers-metadata-gears-category-with-infobox"
          margin="3px"
          title={categoriesToGears[name]
            .map(gear => `${gear.code} - ${gear.name} \n`)
            .toString()
            .replace(/,/g, '')}
        />
      )}
    </Label>
  )
}
