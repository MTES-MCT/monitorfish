import { CountryFlag } from '@components/CountryFlag'
import { COLORS } from '@constants/constants'
import { vesselSize } from '@features/Vessel/types/vessel'
import countries from 'i18n-iso-countries'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { FilterTag } from './FilterTag'
import { IconTypes } from './TagIconType'

import type { FilterValues } from '../../types'

type TagListProps = Readonly<{
  className?: string | undefined
  filters: FilterValues
  uuid?: string
}>
export function TagList({ className, filters, uuid }: TagListProps) {
  const [tags, setTags] = useState<
    Array<{
      iconElement: JSX.Element
      text: string
      type: string
      value: string | number
    }>
  >([])

  useEffect(() => {
    let nextTags: Array<{
      iconElement: JSX.Element
      text: string
      type: string
      value: string | number
    }> = []

    if (filters.countriesFiltered?.length) {
      const countriesTags = filters.countriesFiltered.map(country => ({
        iconElement: <StyledCountryFlag countryCode={country} size={[20, 14]} />,
        text: countries.getName(country, 'fr') ?? country,
        type: 'countriesFiltered',
        value: country
      }))

      nextTags = nextTags.concat(countriesTags)
    }

    if (filters.gearsFiltered?.length) {
      const gearsTags = filters.gearsFiltered.map(gear => ({
        iconElement: IconTypes.GEAR,
        text: gear,
        type: 'gearsFiltered',
        value: gear
      }))

      nextTags = nextTags.concat(gearsTags)
    }

    if (filters.speciesFiltered?.length) {
      const speciesTags = filters.speciesFiltered.map(species => ({
        iconElement: IconTypes.SPECIES,
        text: species,
        type: 'speciesFiltered',
        value: species
      }))

      nextTags = nextTags.concat(speciesTags)
    }

    if (filters.zonesSelected?.length) {
      const zonesSelectedTags = filters.zonesSelected.map(zoneSelected => ({
        iconElement: IconTypes.ZONE,
        text: zoneSelected.name,
        type: 'zonesSelected',
        value: zoneSelected.name
      }))

      nextTags = nextTags.concat(zonesSelectedTags)
    }

    if (filters.fleetSegmentsFiltered?.length) {
      const fleetSegmentsTags = filters.fleetSegmentsFiltered.map(fleetSegment => ({
        iconElement: IconTypes.FLEET_SEGMENT,
        text: fleetSegment,
        type: 'fleetSegmentsFiltered',
        value: fleetSegment
      }))

      nextTags = nextTags.concat(fleetSegmentsTags)
    }

    if (filters.districtsFiltered?.length) {
      const districtsTags = filters.districtsFiltered.map(district => ({
        iconElement: IconTypes.DISTRICTS,
        text: district,
        type: 'districtsFiltered',
        value: district
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
    <List className={className}>
      {tags?.length ? (
        <>
          {tags.map(tag => (
            <FilterTag key={tag.text} iconElement={tag.iconElement} tag={tag} text={tag.text} uuid={uuid} />
          ))}
        </>
      ) : (
        <NoTag>Aucun filtre</NoTag>
      )}
    </List>
  )
}

const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`

const List = styled.div`
  display: inline-block;
  width: 100%;
  text-align: center;
  line-height: 24px;
`

const NoTag = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  color: ${COLORS.slateGray};
`
