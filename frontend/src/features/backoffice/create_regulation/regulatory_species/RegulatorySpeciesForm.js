import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio } from 'rsuite'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import {
  AuthorizedRadio,
  ContentLine,
  CustomCheckbox,
  Delimiter,
  FormContent,
  FormSection,
  RegulatorySectionTitle
} from '../../../commonStyles/Backoffice.style'
import Tag from '../Tag'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { useSelector } from 'react-redux'
import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'
import { RedCircle, GreenCircle } from '../../../commonStyles/Circle.style'

const REGULATORY_SPECIES_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_SPECIES: 'allSpecies',
  SPECIES: 'species',
  SPECIES_GROUPS: 'speciesGroups'
}

export const DEFAULT_SPECIES_CATEGORY_VALUE = 'Choisir une ou des catégories d\'espèces'
export const DEFAULT_SPECIES_VALUE = 'Choisir une ou des espèces'

const RegulatorySpeciesForm = props => {
  const {
    /** @type {Map<string, Species>} speciesByCode */
    speciesByCode,
    formattedSpeciesGroups,
    formattedSpecies
  } = useSelector(state => {
    const formattedSpeciesGroups = [...state.species.speciesGroups]
      ?.sort((speciesA, speciesB) => speciesA.group?.localeCompare(speciesB.group))
      .map(speciesGroup => ({
        label: speciesGroup.group,
        value: speciesGroup.group
      }))

    const formattedSpecies = state.species.speciesByCode
      ? Object.values(state.species.speciesByCode)
        .sort((speciesA, speciesB) => speciesA.name?.localeCompare(speciesB.name))
        .map(_species => ({
          label: `${_species.name} (${_species.code})`,
          value: _species.code
        }))
      : []

    return ({
      speciesByCode: state.species.speciesByCode,
      formattedSpeciesGroups,
      formattedSpecies
    })
  })

  const {
    /** @type {RegulatorySpecies} regulatorySpecies */
    regulatorySpecies,
    setRegulatorySpecies,
    show
  } = props

  const {
    authorized,
    species,
    allSpecies,
    speciesGroups
  } = regulatorySpecies

  const [displayForm, setDisplayForm] = useState(false)

  const set = useCallback((key, value) => {
    const nextRegulatorySpecies = {
      ...regulatorySpecies,
      [key]: value
    }

    setRegulatorySpecies(nextRegulatorySpecies)
  }, [setRegulatorySpecies, regulatorySpecies])

  useEffect(() => {
    if (!displayForm && authorized !== undefined) {
      setDisplayForm(true)
    }

    if (!authorized && species?.length) {
      initSpeciesWithRemarks()
    }

    if (allSpecies && authorized) {
      set(REGULATORY_SPECIES_KEYS.ALL_SPECIES, false)
    }

    function initSpeciesWithRemarks () {
      const nextSpecies = [...species]
        .map(_species => {
          return {
            ..._species,
            remarks: undefined
          }
        })
      set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
    }
  }, [authorized])

  useEffect(() => {
    if (allSpecies) {
      const regulatorySpeciesWithoutSpecies = {
        ...regulatorySpecies,
        [REGULATORY_SPECIES_KEYS.SPECIES]: [],
        [REGULATORY_SPECIES_KEYS.SPECIES_GROUPS]: []
      }

      setRegulatorySpecies(regulatorySpeciesWithoutSpecies)
    }
  }, [allSpecies])

  const push = useCallback((key, array, value) => {
    const newArray = array ? [...array] : []
    newArray.push(value || undefined)

    set(key, newArray)
  }, [set])

  const update = useCallback((id, key, array, value) => {
    const newArray = array ? [...array] : []

    if (id === -1) {
      newArray.push(value)
    } else {
      newArray[id] = value
    }

    set(key, newArray)
  }, [set])

  const removeSpeciesToRegulatorySpeciesList = speciesCodeToRemove => {
    const nextSpecies = [...species]
      .filter(_species => !speciesCodeToRemove.includes(_species.code))
    set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
  }

  const removeSpeciesGroupToRegulatorySpeciesList = speciesGroupToRemove => {
    const nextSpeciesGroups = [...speciesGroups]
      .filter(_species => _species !== speciesGroupToRemove)
    set(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, nextSpeciesGroups)
  }

  const onSpeciesChange = value => {
    if (value === DEFAULT_SPECIES_VALUE) {
      return
    }

    if (species?.some(_species => _species?.code?.includes(value))) {
      removeSpeciesToRegulatorySpeciesList(value)
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
      removeSpeciesGroupToRegulatorySpeciesList(value)
    } else {
      push(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, speciesGroups, value)
    }
  }

  return <FormSection show={show}>
      <RegulatorySectionTitle>
        <AuthorizedRadio
          inline
          onChange={value => set(REGULATORY_SPECIES_KEYS.AUTHORIZED, value)}
          value={authorized}
        >
          Espèces
          <CustomRadio
            checked={authorized}
            value={true}
          >
            autorisées
            <GreenCircle data-cy={'regulation-authorized-species'} margin={'0 6px'} />
          </CustomRadio>
          <CustomRadio
            checked={authorized === false}
            value={false}
          >
            interdites
            <RedCircle margin={'0 6px'} />
          </CustomRadio>
        </AuthorizedRadio>
      </RegulatorySectionTitle>
      <Delimiter width='523' />
      <FormContent display={displayForm} authorized={authorized}>
        {
          !authorized &&
          <ContentLine>
              <CustomCheckbox
                inline
                checked={allSpecies}
                onChange={_ => set(REGULATORY_SPECIES_KEYS.ALL_SPECIES, !allSpecies)}
              >
                Toutes les espèces
              </CustomCheckbox>
          </ContentLine>
        }
        <ContentLine>
          <CustomSelectComponent
            disabled={allSpecies}
            menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
            searchable={true}
            placeholder={DEFAULT_SPECIES_CATEGORY_VALUE}
            onChange={onSpeciesGroupChange}
            value={DEFAULT_SPECIES_CATEGORY_VALUE}
            data={formattedSpeciesGroups}
            emptyMessage={'Aucune catégorie'}
            renderMenuItem={(_, item) => <MenuItem checked={speciesGroups?.includes(item.value)} item={item} tag={'Checkbox'} />}
            menuClassName={DEFAULT_MENU_CLASSNAME}
          />
        </ContentLine>
        <ContentLine>
          {
            formattedSpecies?.length
              ? <CustomSelectComponent
                disabled={allSpecies}
                menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
                searchable={true}
                placeholder={DEFAULT_SPECIES_VALUE}
                onChange={onSpeciesChange}
                value={DEFAULT_SPECIES_VALUE}
                data={formattedSpecies}
                emptyMessage={'Aucune espèce'}
                renderMenuItem={(_, item) =>
                  <MenuItem
                    checked={species?.some(_species => _species?.code?.includes(item.value))}
                    item={item}
                    tag={'Checkbox'}
                  />
                }
                menuClassName={DEFAULT_MENU_CLASSNAME}
              />
              : null
          }
        </ContentLine>
        {
          speciesGroups?.map((speciesGroup, index) => (
            <SpeciesGroupDetail key={speciesGroup.group} isFirst={index === 0}>
              <Label>Catégorie {index + 1}</Label>
              <Tag
                key={speciesGroup}
                tagValue={speciesGroup}
                onCloseIconClicked={removeSpeciesGroupToRegulatorySpeciesList}
              />
            </SpeciesGroupDetail>
          ))
        }
        {
          species?.map((speciesValue, index) => (
            <>
              {authorized
                ? <SpeciesDetails key={speciesValue.code} isFirst={index === 0 && !speciesGroups?.length}>
                  <SpeciesDetail>
                    <Label>Espèce {index + 1}</Label>
                    <Tag
                      key={speciesValue.code}
                      tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                      onCloseIconClicked={removeSpeciesToRegulatorySpeciesList}
                    />
                  </SpeciesDetail>
                  <SpeciesDetail>
                    <Label>Remarques</Label>
                    <CustomInput
                      data-cy={'regulatory-species-remarks'}
                      as="textarea"
                      rows={2}
                      placeholder=''
                      value={speciesValue.remarks || ''}
                      onChange={event =>
                        update(index, REGULATORY_SPECIES_KEYS.SPECIES, species, {
                          ...speciesValue,
                          remarks: event.target.value
                        })}
                      width={'300px'}
                      $isGray={species.find(_species => _species.code === speciesValue.code)?.remarks}
                    />
                  </SpeciesDetail>
                </SpeciesDetails>
                : <SpeciesDetail key={speciesValue.code} onlySpeciesName={!authorized}>
                  <Label>Espèce {index + 1}</Label>
                  <Tag
                    key={speciesValue.code}
                    tagValue={`${speciesByCode[speciesValue.code]?.name} (${speciesValue.code})`}
                    onCloseIconClicked={removeSpeciesToRegulatorySpeciesList}
                  />
                </SpeciesDetail>
              }
              </>
          ))
        }
      </FormContent>
    </FormSection>
}

const SpeciesDetails = styled.div`
  width: 100%;
  margin-top: ${props => props.isFirst ? 20 : 15}px;
`

const SpeciesDetail = styled.div`
  display: flex;
  margin-top: ${props => props.onlySpeciesName ? 8 : 5}px;
`

const SpeciesGroupDetail = styled.div`
  display: flex;
  margin-top: ${props => props.isFirst ? 20 : 8}px;
`

const CustomRadio = styled(Radio)`
  .rs-radio-checker {
    padding-top: 0px;
    padding-bottom: 4px;
    padding-left: 29px;
    min-height: 0px;
    line-height: 1;
    position: relative;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
    margin-right: 0px;
  }

  .rs-radio-checker > label {
    font-size: 13px;
    vertical-align: sub;
    color: ${COLORS.gunMetal};
  }
`

export default RegulatorySpeciesForm
