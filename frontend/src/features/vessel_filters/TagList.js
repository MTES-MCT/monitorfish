import countries from 'i18n-iso-countries'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { vesselSize } from '../../domain/entities/vessel'
import FilterTag from './FilterTag'
import { IconTypes } from './TagIconType'

function TagList({ filters, removeTagFromFilter, uuid }) {
  const [tags, setTags] = useState([])

  useEffect(() => {
    let nextTags = []

    if (filters.countriesFiltered?.length) {
      const countriesTags = filters.countriesFiltered.map(country => ({
          iconElement: <Flag title={countries.getName(country, 'fr')} rel="preload" src={`flags/${country}.svg`}/>,
          text: countries.getName(country, 'fr'),
          value: country,
          type: 'countriesFiltered'
        }))

      nextTags = nextTags.concat(countriesTags)
    }

    if (filters.gearsFiltered?.length) {
      const gearsTags = filters.gearsFiltered.map(gear => ({
          iconElement: IconTypes.GEAR,
          text: gear,
          value: gear,
          type: 'gearsFiltered'
        }))

      nextTags = nextTags.concat(gearsTags)
    }

    if (filters.speciesFiltered?.length) {
      const speciesTags = filters.speciesFiltered.map(species => ({
          iconElement: IconTypes.SPECIES,
          text: species,
          value: species,
          type: 'speciesFiltered'
        }))

      nextTags = nextTags.concat(speciesTags)
    }

    if (filters.zonesSelected?.length) {
      const zonesSelectedTags = filters.zonesSelected.map(zoneSelected => ({
          iconElement: IconTypes.ZONE,
          text: zoneSelected.name,
          value: zoneSelected.name,
          type: 'zonesSelected'
        }))

      nextTags = nextTags.concat(zonesSelectedTags)
    }

    if (filters.fleetSegmentsFiltered?.length) {
      const fleetSegmentsTags = filters.fleetSegmentsFiltered.map(fleetSegment => ({
          iconElement: IconTypes.FLEET_SEGMENT,
          text: fleetSegment,
          value: fleetSegment,
          type: 'fleetSegmentsFiltered'
        }))

      nextTags = nextTags.concat(fleetSegmentsTags)
    }

    if (filters.districtsFiltered?.length) {
      const districtsTags = filters.districtsFiltered.map(district => ({
          iconElement: IconTypes.DISTRICTS,
          text: district,
          value: district,
          type: 'districtsFiltered'
        }))

      nextTags = nextTags.concat(districtsTags)
    }

    if (filters.vesselsSizeValuesChecked?.length) {
      const vesselsLengthTags = filters.vesselsSizeValuesChecked.map(lengthCode => {
        const sizeObject = Object.keys(vesselSize)
          .map(key => vesselSize[key])
          .find(size => size.code === lengthCode)

        return {
          iconElement: IconTypes.LENGTH,
          text: sizeObject ? sizeObject.text : '',
          type: 'vesselsSizeValuesChecked',
          value: sizeObject ? sizeObject.code : ''
        }
      })

      nextTags = nextTags.concat(vesselsLengthTags)
    }

    if (filters.lastControlMonthsAgo) {
      const lastControlMonthAgoTag = {
        iconElement: IconTypes.CONTROL,
        text: `Plus de ${filters.lastControlMonthsAgo} mois`,
        type: 'lastControlMonthsAgo',
        value: filters.lastControlMonthsAgo
      }

      nextTags = nextTags.concat(lastControlMonthAgoTag)
    }

    setTags(nextTags)
  }, [filters])

  return (
    <List>
      {tags?.length ? (
        tags.map(tag => <FilterTag
              uuid={uuid}
              type={tag.type}
              iconType={tag.iconType}
              iconElement={tag.iconElement}
              key={tag.text}
              text={tag.text}
              value={tag.value}
              removeTagFromFilter={removeTagFromFilter}
            />)
        })
      ) : (
        <NoTag>Aucun filtre</NoTag>
      )}
    </List>
  )
}

const List = styled.div`
  display: inline-block;
  width: 100%;
  text-align: center;
`

const Flag = styled.img`
  height: 14px;
  margin-bottom: 3px;
  margin-right: 5px;
`

const NoTag = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  color: ${COLORS.slateGray};
`

export default TagList
