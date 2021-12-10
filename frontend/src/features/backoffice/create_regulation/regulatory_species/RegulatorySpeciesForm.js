import React, { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import { ContentLine, CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import Tag from '../Tag'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { useSelector } from 'react-redux'
import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'

const REGULATORY_SPECIES_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_SPECIES: 'allSpecies',
  SPECIES: 'species',
  SPECIES_GROUPS: 'speciesGroups'
}

const RegulatorySpeciesForm = props => {
  const {
    /** @type {Species} speciesCodesState */
    species: speciesCodesState,
    /** @type {SpeciesGroup} speciesGroupsState */
    speciesGroups: speciesGroupsState
  } = useSelector(state => state.species)

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

  useEffect(() => {
    if (!displayForm && authorized !== undefined) {
      setDisplayForm(true)
    }

    if (!authorized && species?.length) {
      initSpeciesQuantityAndMinimumSize()
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

  function initSpeciesQuantityAndMinimumSize () {
    const nextSpecies = [...species]
      .map(species => {
        return {
          ...species,
          minimumSize: undefined,
          quantity: undefined
        }
      })
    set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
  }

  const set = useCallback((key, value) => {
    const nextRegulatorySpecies = {
      ...regulatorySpecies,
      [key]: value
    }

    setRegulatorySpecies(nextRegulatorySpecies)
  }, [setRegulatorySpecies, regulatorySpecies])

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
      .filter(species => species.code !== speciesCodeToRemove)
    set(REGULATORY_SPECIES_KEYS.SPECIES, nextSpecies)
  }

  const removeSpeciesGroupToRegulatorySpeciesList = speciesGroupToRemove => {
    const nextSpeciesGroups = [...speciesGroups]
      .filter(species => species !== speciesGroupToRemove)
    set(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, nextSpeciesGroups)
  }

  const onSpeciesChange = value => {
    if (species?.some(species => species?.code?.includes(value))) {
      removeSpeciesToRegulatorySpeciesList(value)
    } else {
      push(REGULATORY_SPECIES_KEYS.SPECIES, species, {
        code: value,
        quantity: undefined,
        minimumSize: undefined
      })
    }
  }

  const onSpeciesGroupChange = value => {
    if (speciesGroups?.includes(value)) {
      removeSpeciesGroupToRegulatorySpeciesList(value)
    } else {
      push(REGULATORY_SPECIES_KEYS.SPECIES_GROUPS, speciesGroups, value)
    }
  }

  function getFormattedSpeciesGroups () {
    return [...speciesGroupsState]
      ?.sort((speciesA, speciesB) => speciesB.group - speciesA.group)
      .map(speciesGroup => ({
        label: speciesGroup.group,
        value: speciesGroup.group
      }))
  }

  function getFormattedSpecies () {
    return [...speciesCodesState]
      ?.sort((speciesA, speciesB) => speciesB.code - speciesA.code)
      .map(species => ({
        label: `${species.name} (${species.code})`,
        value: species.code
      }))
  }

  return <Wrapper show={show}>
    <Title>
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
          <GreenCircle data-cy={'regulation-authorized-species'}/>
        </CustomRadio>
        <CustomRadio
          checked={authorized === false}
          value={false}
        >
          interdites
          <RedCircle />
        </CustomRadio>
      </AuthorizedRadio>
    </Title>
    <Content $display={displayForm} authorized={authorized}>
      {
        !authorized &&
        <ContentLine>
            <CustomCheckbox
              inline
              checked
              value={REGULATORY_SPECIES_KEYS.ALL_SPECIES}
              onChange={value => set(REGULATORY_SPECIES_KEYS.ALL_SPECIES, value)}
            >
              Toutes les espèces
            </CustomCheckbox>
        </ContentLine>
      }
      <ContentLine>
        <CustomSelectComponent
          placement={'topStart'}
          disabled={allSpecies}
          menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
          searchable={true}
          placeholder={'Choisir une ou des catégories d\'espèces'}
          onChange={onSpeciesGroupChange}
          value={'Choisir une ou des catégories d\'espèces'}
          data={getFormattedSpeciesGroups()}
          emptyMessage={'Aucune catégorie'}
          renderMenuItem={(_, item) => <MenuItem checked={speciesGroups?.includes(item.value)} item={item} tag={'Checkbox'} />}
          menuClassName={DEFAULT_MENU_CLASSNAME}
        />
      </ContentLine>
      <ContentLine>
        <CustomSelectComponent
          placement={'topStart'}
          disabled={allSpecies}
          menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis' }}
          searchable={true}
          placeholder={'Choisir une ou des espèces'}
          onChange={onSpeciesChange}
          value={'Choisir une ou des espèces'}
          data={getFormattedSpecies()}
          emptyMessage={'Aucune espèce'}
          renderMenuItem={(_, item) =>
            <MenuItem checked={species?.some(species => species?.code?.includes(item.value))} item={item} tag={'Checkbox'} />}
          menuClassName={DEFAULT_MENU_CLASSNAME}
        />
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
                    tagValue={speciesValue.code}
                    onCloseIconClicked={removeSpeciesToRegulatorySpeciesList}
                  />
                </SpeciesDetail>
                <SpeciesDetail>
                  <Label>Quantités</Label>
                  <CustomInput
                    data-cy={'regulatory-species-quantity'}
                    placeholder=''
                    value={speciesValue.quantity || ''}
                    onChange={value => update(index, REGULATORY_SPECIES_KEYS.SPECIES, species, { ...speciesValue, quantity: value })}
                    width={'200px'}
                    $isGray={species.find(species => species.code === speciesValue.code)?.quantity}
                  />
                </SpeciesDetail>
                <SpeciesDetail>
                  <Label>Taille minimale</Label>
                  <CustomInput
                    data-cy={'regulatory-species-minimum-size'}
                    placeholder=''
                    value={speciesValue.minimumSize || ''}
                    onChange={value => update(index, REGULATORY_SPECIES_KEYS.SPECIES, species, { ...speciesValue, minimumSize: value })}
                    width={'200px'}
                    $isGray={species.find(species => species.code === speciesValue.code)?.minimumSize}
                  />
                </SpeciesDetail>
              </SpeciesDetails>
              : <SpeciesDetail key={speciesValue.code} onlySpeciesName={!authorized}>
                <Label>Espèce {index + 1}</Label>
                <Tag
                  key={speciesValue.code}
                  tagValue={speciesValue.code}
                  onCloseIconClicked={removeSpeciesToRegulatorySpeciesList}
                />
              </SpeciesDetail>
            }
            </>
        ))
      }
    </Content>
  </Wrapper>
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

/* const CustomCheckboxGroup = styled(CheckboxGroup)`
  margin-bottom: 5px;
` */

const Content = styled.div`
${props => !props.$display ? 'display: none;' : ''}
  padding-left: 15px;
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
`

const Wrapper = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
  width: 100%;
  margin-bottom: ${props => props.show ? 10 : 0}px;
`

const normalTitle = css`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  border-bottom: 1px solid ${COLORS.lightGray};
`
const Title = styled.div`
  ${normalTitle}
  margin-bottom: 18px;
`

const circle = css`
  display: inline-block;
  height: 10px;
  width: 10px;
  margin-left: 6px;
  border-radius: 50%;
  vertical-align: middle;
`
const GreenCircle = styled.span`
  ${circle}
  background-color: ${COLORS.mediumSeaGreen};
`

const RedCircle = styled.span`
  ${circle}
  background-color: ${COLORS.red};
`

const AuthorizedRadio = styled(RadioGroup)` 
  display: flex;
  flex-direction: row;
  align-items: center;
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
