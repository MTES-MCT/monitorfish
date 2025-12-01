import { Checkbox, type Option } from '@mtes-mct/monitor-ui'
import { Fragment, useCallback } from 'react'
import styled from 'styled-components'

import {
  ContentLine,
  Delimiter,
  FormContent,
  FormSection,
  RegulatorySectionTitle
} from '../../../../commonStyles/Backoffice.style'
import { GreenCircle, RedCircle } from '../../../../commonStyles/Circle.style'
import { CustomInput, Label } from '../../../../commonStyles/Input.style'
import { DEFAULT_AUTHORIZED_REGULATED_SPECIES, DEFAULT_UNAUTHORIZED_REGULATED_SPECIES } from '../../../utils'
import { CustomSelectComponent } from '../custom_form/CustomSelectComponent'
import { MenuItem } from '../custom_form/MenuItem'
import { Tag } from '../Tag'

import type { RegulatedSpecies as RegulatedSpeciesType } from '@features/Regulation/types'
import type { Specy } from 'domain/types/specy'

const REGULATORY_SPECIES_KEYS = {
  ALL_SPECIES: 'allSpecies',
  SPECIES: 'species',
  SPECIES_GROUPS: 'speciesGroups'
}

export const DEFAULT_SPECIES_CATEGORY_VALUE = "Choisir une ou des catégories d'espèces"
export const DEFAULT_SPECIES_VALUE = 'Choisir une ou des espèces'

type RegulatedSpeciesProps = Readonly<{
  authorized: boolean
  formattedSpecies: Option[]
  formattedSpeciesGroups: Option[]
  regulatedSpecies: RegulatedSpeciesType | null
  setRegulatedSpecies: (isAuthorized: boolean, regulatedSpecies: RegulatedSpeciesType) => void
  show: boolean
  speciesByCode: Record<string, Specy>
}>
export function RegulatedSpecies({
  authorized,
  formattedSpecies,
  formattedSpeciesGroups,
  regulatedSpecies,
  setRegulatedSpecies,
  show,
  speciesByCode
}: RegulatedSpeciesProps) {
  const controlledRegulatedSpecies =
    regulatedSpecies ?? (authorized ? DEFAULT_AUTHORIZED_REGULATED_SPECIES : DEFAULT_UNAUTHORIZED_REGULATED_SPECIES)
  const { species, speciesGroups } = controlledRegulatedSpecies

  const set = useCallback(
    (key, value) => {
      const nextRegulatedSpecies: RegulatedSpeciesType = {
        ...controlledRegulatedSpecies,
        [key]: value
      }

      setRegulatedSpecies(authorized, nextRegulatedSpecies)
    },
    [authorized, controlledRegulatedSpecies, setRegulatedSpecies]
  )

  const onAllSpeciesChange = useCallback(
    _allSpecies => {
      if (_allSpecies) {
        const nextRegulatedSpeciesWithoutSpeciesAndGroups = {
          ...controlledRegulatedSpecies,
          [REGULATORY_SPECIES_KEYS.SPECIES]: [],
          [REGULATORY_SPECIES_KEYS.SPECIES_GROUPS]: [],
          [REGULATORY_SPECIES_KEYS.ALL_SPECIES]: true
        }

        setRegulatedSpecies(authorized, nextRegulatedSpeciesWithoutSpeciesAndGroups)
      } else {
        set(REGULATORY_SPECIES_KEYS.ALL_SPECIES, false)
      }
    },
    [authorized, controlledRegulatedSpecies, set, setRegulatedSpecies]
  )

  const push = useCallback(
    (key, array, value) => {
      const newArray = array ? [...array] : []
      newArray.push(value || undefined)

      set(key, newArray)
    },
    [set]
  )

  const update = useCallback(
    (id, key, array, value) => {
      const newArray = array ? [...array] : []

      if (id === -1) {
        newArray.push(value)
      } else {
        newArray[id] = value
      }

      set(key, newArray)
    },
    [set]
  )

  const removeSpeciesToSpeciesList = speciesCodeToRemove => {
    const nextSpecies = [...species].filter(_species => !speciesCodeToRemove.includes(_species.code))
    set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
  }

  const removeSpeciesGroupToSpeciesGroupList = speciesGroupToRemove => {
    const nextSpeciesGroups = [...speciesGroups].filter(_species => _species !== speciesGroupToRemove)
    set(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, nextSpeciesGroups)
  }

  const onSpeciesChange = value => {
    if (value === DEFAULT_SPECIES_VALUE) {
      return
    }

    if (species?.some(_species => _species?.code?.includes(value))) {
      removeSpeciesToSpeciesList(value)
    } else {
      push(REGULATORY_SPECIES_KEYS.SPECIES, species, {
        code: value,
        name: speciesByCode[value]?.name,
        remarks: undefined
      })
    }
  }

  const onSpeciesGroupChange = value => {
    if (value === DEFAULT_SPECIES_CATEGORY_VALUE) {
      return
    }

    if (speciesGroups?.includes(value)) {
      removeSpeciesGroupToSpeciesGroupList(value)
    } else {
      push(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, speciesGroups, value)
    }
  }

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <FormSection $show={show}>
      <RegulatorySectionTitle>
        {authorized ? <GreenCircle $margin="0 6px" /> : <RedCircle $margin="0 6px" />}
        Espèces {authorized ? 'autorisées' : 'interdites'}
      </RegulatorySectionTitle>
      <Delimiter width={523} />
      <FormContent $display>
        {!authorized && (
          <ContentLine>
            <Checkbox
              checked={!!controlledRegulatedSpecies.allSpecies}
              inline
              label="Toutes les espèces"
              name="allSpecies"
              onChange={_unused => onAllSpeciesChange(!controlledRegulatedSpecies.allSpecies)}
            />
          </ContentLine>
        )}
        <ContentLine>
          <CustomSelectComponent
            disabled={!!controlledRegulatedSpecies.allSpecies}
            emptyMessage="Aucune catégorie"
            label="Catégorie d'espèces"
            name="speciesGroups"
            onChange={onSpeciesGroupChange}
            options={formattedSpeciesGroups}
            placeholder={DEFAULT_SPECIES_CATEGORY_VALUE}
            renderMenuItem={(_label, item) => (
              <MenuItem checked={speciesGroups?.includes(item.value)} item={item} tag="Checkbox" />
            )}
            searchable
            value={DEFAULT_SPECIES_CATEGORY_VALUE}
            virtualized
            width={300}
          />
        </ContentLine>
        <ContentLine>
          {formattedSpecies?.length ? (
            <CustomSelectComponent
              dataCy={`${dataCyTarget}-species-selector`}
              disabled={!!controlledRegulatedSpecies.allSpecies}
              emptyMessage="Aucune espèce"
              label="Espèce"
              name="species"
              onChange={onSpeciesChange}
              options={formattedSpecies}
              placeholder={DEFAULT_SPECIES_VALUE}
              renderMenuItem={(_label, item) => (
                <MenuItem
                  checked={species?.some(_species => _species?.code?.includes(item.value))}
                  item={item}
                  tag="Checkbox"
                />
              )}
              searchable
              value={DEFAULT_SPECIES_VALUE}
              virtualized
              width={300}
            />
          ) : null}
        </ContentLine>
        {speciesGroups?.map((speciesGroup, index) => (
          <SpeciesGroupDetail key={speciesGroup} $isFirst={index === 0}>
            <Label>Catégorie {index + 1}</Label>
            <Tag onCloseIconClicked={removeSpeciesGroupToSpeciesGroupList} tagValue={speciesGroup} />
          </SpeciesGroupDetail>
        ))}
        {species?.map((speciesValue, index) => (
          <Fragment key={speciesValue.code}>
            {authorized ? (
              <SpeciesDetails $isFirst={index === 0 && !speciesGroups?.length}>
                <SpeciesDetail>
                  <Label>Espèce {index + 1}</Label>
                  <Tag
                    onCloseIconClicked={removeSpeciesToSpeciesList}
                    tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                  />
                </SpeciesDetail>
                <SpeciesDetail>
                  <Label>Remarques</Label>
                  <CustomInput
                    $isGray
                    as="textarea"
                    data-cy={`${dataCyTarget}-regulatory-species-remarks`}
                    onChange={event =>
                      update(index, REGULATORY_SPECIES_KEYS.SPECIES, species, {
                        ...speciesValue,
                        remarks: event.target.value
                      })
                    }
                    placeholder=""
                    rows={2}
                    value={speciesValue.remarks || ''}
                    width="300px"
                  />
                </SpeciesDetail>
              </SpeciesDetails>
            ) : (
              <SpeciesDetail $onlySpeciesName={!authorized}>
                <Label>Espèce {index + 1}</Label>
                <Tag
                  onCloseIconClicked={removeSpeciesToSpeciesList}
                  tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                />
              </SpeciesDetail>
            )}
          </Fragment>
        ))}
      </FormContent>
    </FormSection>
  )
}

const SpeciesDetails = styled.div<{
  $isFirst: boolean
}>`
  width: 100%;
  margin-top: ${p => (p.$isFirst ? 20 : 15)}px;
`

const SpeciesDetail = styled.div<{
  $onlySpeciesName?: boolean
}>`
  display: flex;
  margin-top: ${p => (p.$onlySpeciesName ? 8 : 5)}px;
`

const SpeciesGroupDetail = styled.div<{
  $isFirst: boolean
}>`
  display: flex;
  margin-top: ${p => (p.$isFirst ? 20 : 8)}px;
`
