import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'
import {
  ContentLine,
  CustomCheckbox,
  Delimiter,
  FormContent,
  FormSection,
  RegulatorySectionTitle,
} from '../../../commonStyles/Backoffice.style'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'

const REGULATORY_SPECIES_KEYS = {
  ALL_SPECIES: 'allSpecies',
  SPECIES: 'species',
  SPECIES_GROUPS: 'speciesGroups',
}

export const DEFAULT_SPECIES_CATEGORY_VALUE = "Choisir une ou des catégories d'espèces"
export const DEFAULT_SPECIES_VALUE = 'Choisir une ou des espèces'

function RegulatedSpecies(props) {
  const {
    authorized,
    /** @type {RegulatedSpecies} regulatedSpecies */
    formattedSpecies,
    formattedSpeciesGroups,
    regulatedSpecies,
    setRegulatedSpecies,
    show,
    speciesByCode,
  } = props

  const { allSpecies, species, speciesGroups } = regulatedSpecies

  const set = useCallback(
    (key, value) => {
      const nextRegulatedSpecies = {
        ...regulatedSpecies,
        [key]: value,
      }

      setRegulatedSpecies(authorized, nextRegulatedSpecies)
    },
    [authorized, regulatedSpecies, setRegulatedSpecies],
  )

  useEffect(() => {
    function initSpeciesWithRemarks() {
      const nextSpecies = [...species].map(_species => ({
        ..._species,
        remarks: undefined,
      }))
      set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
    }

    if (!authorized && species?.length) {
      initSpeciesWithRemarks()
    }
  }, [authorized])

  const onAllSpeciesChange = useCallback(
    allSpecies => {
      if (allSpecies) {
        const nextRegulatedSpeciesWithoutSpeciesAndGroups = {
          ...regulatedSpecies,
          [REGULATORY_SPECIES_KEYS.SPECIES]: [],
          [REGULATORY_SPECIES_KEYS.SPECIES_GROUPS]: [],
          [REGULATORY_SPECIES_KEYS.ALL_SPECIES]: true,
        }

        setRegulatedSpecies(authorized, nextRegulatedSpeciesWithoutSpeciesAndGroups)
      } else {
        set(REGULATORY_SPECIES_KEYS.ALL_SPECIES, false)
      }
    },
    [regulatedSpecies, authorized],
  )

  const push = useCallback(
    (key, array, value) => {
      const newArray = array ? [...array] : []
      newArray.push(value || undefined)

      set(key, newArray)
    },
    [set],
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
    [set],
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
        remarks: undefined,
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
    <FormSection show={show}>
      <RegulatorySectionTitle>
        {authorized ? <GreenCircle margin="0 6px" /> : <RedCircle margin="0 6px" />}
        Espèces {authorized ? 'autorisées' : 'interdites'}
      </RegulatorySectionTitle>
      <Delimiter width="523" />
      <FormContent authorized={authorized} display>
        {!authorized && (
          <ContentLine>
            <CustomCheckbox checked={allSpecies} inline onChange={_ => onAllSpeciesChange(!allSpecies)}>
              Toutes les espèces
            </CustomCheckbox>
          </ContentLine>
        )}
        <ContentLine>
          <CustomSelectComponent
            data={formattedSpeciesGroups}
            disabled={allSpecies}
            emptyMessage="Aucune catégorie"
            menuClassName={DEFAULT_MENU_CLASSNAME}
            menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
            onChange={onSpeciesGroupChange}
            placeholder={DEFAULT_SPECIES_CATEGORY_VALUE}
            renderMenuItem={(_, item) => (
              <MenuItem checked={speciesGroups?.includes(item.value)} item={item} tag="Checkbox" />
            )}
            searchable
            value={DEFAULT_SPECIES_CATEGORY_VALUE}
          />
        </ContentLine>
        <ContentLine>
          {formattedSpecies?.length ? (
            <CustomSelectComponent
              data={formattedSpecies}
              dataCy={`${dataCyTarget}-species-selector`}
              disabled={allSpecies}
              emptyMessage="Aucune espèce"
              menuClassName={DEFAULT_MENU_CLASSNAME}
              menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
              onChange={onSpeciesChange}
              placeholder={DEFAULT_SPECIES_VALUE}
              renderMenuItem={(_, item) => (
                <MenuItem
                  checked={species?.some(_species => _species?.code?.includes(item.value))}
                  item={item}
                  tag="Checkbox"
                />
              )}
              searchable
              value={DEFAULT_SPECIES_VALUE}
            />
          ) : null}
        </ContentLine>
        {speciesGroups?.map((speciesGroup, index) => (
          <SpeciesGroupDetail key={speciesGroup.group} isFirst={index === 0}>
            <Label>Catégorie {index + 1}</Label>
            <Tag key={speciesGroup} onCloseIconClicked={removeSpeciesGroupToSpeciesGroupList} tagValue={speciesGroup} />
          </SpeciesGroupDetail>
        ))}
        {species?.map((speciesValue, index) => (
          <>
            {authorized ? (
              <SpeciesDetails key={speciesValue.code} isFirst={index === 0 && !speciesGroups?.length}>
                <SpeciesDetail>
                  <Label>Espèce {index + 1}</Label>
                  <Tag
                    key={speciesValue.code}
                    onCloseIconClicked={removeSpeciesToSpeciesList}
                    tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                  />
                </SpeciesDetail>
                <SpeciesDetail>
                  <Label>Remarques</Label>
                  <CustomInput
                    $isGray={species.find(_species => _species.code === speciesValue.code)?.remarks}
                    as="textarea"
                    data-cy={`${dataCyTarget}-regulatory-species-remarks`}
                    onChange={event =>
                      update(index, REGULATORY_SPECIES_KEYS.SPECIES, species, {
                        ...speciesValue,
                        remarks: event.target.value,
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
              <SpeciesDetail key={speciesValue.code} onlySpeciesName={!authorized}>
                <Label>Espèce {index + 1}</Label>
                <Tag
                  key={speciesValue.code}
                  onCloseIconClicked={removeSpeciesToSpeciesList}
                  tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                />
              </SpeciesDetail>
            )}
          </>
        ))}
      </FormContent>
    </FormSection>
  )
}

const SpeciesDetails = styled.div`
  width: 100%;
  margin-top: ${props => (props.isFirst ? 20 : 15)}px;
`

const SpeciesDetail = styled.div`
  display: flex;
  margin-top: ${props => (props.onlySpeciesName ? 8 : 5)}px;
`

const SpeciesGroupDetail = styled.div`
  display: flex;
  margin-top: ${props => (props.isFirst ? 20 : 8)}px;
`

export default RegulatedSpecies
