import React from 'react'
import { Label } from './RegulatoryMetadata.style'
import { COLORS } from '../../../../../constants/constants'
import InfoPoint from '../../../../Backoffice/edit_regulation/InfoPoint'

const CodeAndName = ({ code, name, isCategory, categoriesToGears }) => {
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

export default CodeAndName
