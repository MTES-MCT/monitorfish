// TODO Remove temporary `any`, `as any` and `@ts-ignore` (fresh migration to TS).

import { Label } from './RegulatoryMetadata.style'
import { COLORS } from '../../../../../constants/constants'
import { InfoPoint } from '../../../../Backoffice/edit_regulation/InfoPoint'

export type CodeAndNameProps = {
  code: string
  name: string
  isCategory?: boolean
  categoriesToGears?: any
}
export function CodeAndName({ code, name, isCategory = false, categoriesToGears }: CodeAndNameProps) {
  return (
    <Label>
      {`${code ? `${code} ${name ? `(${name})` : ''}` : `${name ? `${name}` : ''}`}`}
      {isCategory && categoriesToGears && categoriesToGears[name] && (
        <InfoPoint
          dataCy={'regulatory-layers-metadata-gears-category-with-infobox'}
          title={categoriesToGears[name]
            .map(gear => `${gear.code} - ${gear.name} \n`)
            .toString()
            .replace(/,/g, '')}
          margin={'3px'}
          backgroundColor={COLORS.charcoal}
        />
      )}
    </Label>
  )
}
