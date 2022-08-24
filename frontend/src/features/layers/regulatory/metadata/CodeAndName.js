import React from 'react'

import { COLORS } from '../../../../constants/constants'
import InfoPoint from '../../../backoffice/edit_regulation/InfoPoint'
import { Label } from './RegulatoryMetadata.style'

function CodeAndName({ categoriesToGears, code, isCategory, name }) {
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

export default CodeAndName
