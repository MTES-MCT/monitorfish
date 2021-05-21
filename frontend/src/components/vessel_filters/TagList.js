import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import countries from 'i18n-iso-countries'
import FilterTag from './FilterTag'
import { IconTypes } from './TagIconType'
import { vesselSize } from '../../domain/entities/vessel'

const TagList = ({ filters, uuid, removeTagFromFilter }) => {
  const [tags, setTags] = useState([])

  useEffect(() => {
    let nextTags = []

    if (filters.countriesFiltered && filters.countriesFiltered.length) {
      const countriesTags = filters.countriesFiltered.map(country => {
        return {
          iconElement: <Flag title={countries.getName(country, 'fr')} rel="preload" src={`flags/${country}.svg`}/>,
          text: countries.getName(country, 'fr'),
          type: 'countriesFiltered'
        }
      })

      nextTags = nextTags.concat(countriesTags)
    }

    if (filters.gearsFiltered && filters.gearsFiltered.length) {
      const gearsTags = filters.gearsFiltered.map(gear => {
        return {
          iconElement: IconTypes.GEAR,
          text: gear,
          type: 'gearsFiltered'
        }
      })

      nextTags = nextTags.concat(gearsTags)
    }

    if (filters.speciesFiltered && filters.speciesFiltered.length) {
      const speciesTags = filters.speciesFiltered.map(species => {
        return {
          iconElement: IconTypes.SPECIES,
          text: species,
          type: 'speciesFiltered'
        }
      })

      nextTags = nextTags.concat(speciesTags)
    }

    if (filters.zonesSelected && filters.zonesSelected.length) {
      const zonesSelectedTags = filters.zonesSelected.map(zoneSelected => {
        return {
          iconElement: IconTypes.ZONE,
          text: zoneSelected.name,
          type: 'zonesSelected'
        }
      })

      nextTags = nextTags.concat(zonesSelectedTags)
    }

    if (filters.fleetSegmentsFiltered && filters.fleetSegmentsFiltered.length) {
      const fleetSegmentsTags = filters.fleetSegmentsFiltered.map(fleetSegment => {
        return {
          iconElement: IconTypes.FLEET_SEGMENT,
          text: fleetSegment,
          type: 'fleetSegmentsFiltered'
        }
      })

      nextTags = nextTags.concat(fleetSegmentsTags)
    }

    if (filters.districtsFiltered && filters.districtsFiltered.length) {
      const districtsTags = filters.districtsFiltered.map(district => {
        return {
          iconElement: IconTypes.DISTRICTS,
          text: district,
          type: 'districtsFiltered'
        }
      })

      nextTags = nextTags.concat(districtsTags)
    }

    if (filters.vesselsSizeValuesChecked && filters.vesselsSizeValuesChecked.length) {
      const vesselsLengthTags = filters.vesselsSizeValuesChecked.map(lengthCode => {
        const sizeObject = Object.keys(vesselSize)
          .map(key => vesselSize[key])
          .find(size => size.code === lengthCode)

        return {
          iconElement: IconTypes.LENGTH,
          text: sizeObject ? sizeObject.text : '',
          type: 'vesselsSizeValuesChecked'
        }
      })

      nextTags = nextTags.concat(vesselsLengthTags)
    }

    setTags(nextTags)
  }, [filters])

  return (
    <List>
      {
        tags && tags.length
          ? tags.map(tag => {
            return <FilterTag
              uuid={uuid}
              type={tag.type}
              iconType={tag.iconType}
              iconElement={tag.iconElement}
              key={tag.text}
              value={tag.text}
              removeTagFromFilter={removeTagFromFilter}
            />
          })
          : <NoTag>Aucun filtre</NoTag>
      }
    </List>
  )
}

const List = styled.div`
  display: inline-block;
`

const Flag = styled.img`
  height: 14px;
  margin-bottom: 3px;
  margin-right: 5px;
`

const NoTag = styled.div`
  margin-top: 20x;
  margin-bottom: 10x;
  font-size: 13px;
  color: ${COLORS.textGray};
`

export default TagList
