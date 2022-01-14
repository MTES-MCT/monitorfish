import React, { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CustomCheckbox, customRadioGroup, AuthorizedRadio,
  Delimiter, RegulatorySectionTitle, FormSection, FormContent
} from '../../../commonStyles/Backoffice.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, RadioGroup, MultiCascader } from 'rsuite'
import GearLine from './GearLine'
import getAllGearCodes from '../../../../domain/use_cases/getAllGearCodes'
import { GEARS_CATEGORES_WITH_MESH, prepareCategoriesAndGearsToDisplay } from '../../../../domain/entities/regulatory'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'

const REGULATORY_GEAR_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_GEARS: 'allGears',
  ALL_TOWED_GEARS: 'allTowedGears',
  ALL_PASSIVE_GEARS: 'allPassiveGears',
  REGULATED_GEARS: 'regulatedGears',
  REGULATED_GEAR_CATEGORIES: 'regulatedGearCategories',
  SELECTED_GEARS_AND_CATEGORIES: 'selectedCategoriesAndGears',
  DEROGATION: 'derogation'
}

const RegulatoryGearForm = (props) => {
  const {
    regulatoryGears,
    setRegulatoryGears,
    show
  } = props

  const {
    /** @type {Gear[]} */
    regulatedGears,
    /** @type {GearCategory[]} */
    regulatedGearCategories,
    /** @type {string[]} */
    selectedCategoriesAndGears,
    authorized,
    allGears,
    allTowedGears,
    allPassiveGears,
    derogation
  } = regulatoryGears

  const dispatch = useDispatch()
  const {
    /** @type {Object.<string, Gear[]>} */
    categoriesToGears,
    groupsToCategories,
    gearsByCode
  } = useSelector(state => state.gear)
  /** @type {string[]} */
  const [allCategoriesAndGears, setAllCategoriesAndGears] = useState([])

  useEffect(() => {
    if (!categoriesToGears || !groupsToCategories || gearsByCode) {
      dispatch(getAllGearCodes())
    }
  }, [])

  useEffect(() => {
    if (categoriesToGears) {
      setAllCategoriesAndGears(prepareCategoriesAndGearsToDisplay(categoriesToGears))
    }
  }, [categoriesToGears])

  useEffect(() => {
    if (selectedCategoriesAndGears?.length > 0) {
      const categories = []
      const gears = []
      selectedCategoriesAndGears.forEach(value => {
        if (isCategory(value)) {
          categories.push(value)
        } else {
          gears.push(value)
        }
      })
      set(REGULATORY_GEAR_KEYS.REGULATED_GEARS, gears)
      set(REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES, categories)
    }
  }, [selectedCategoriesAndGears])

  const onCheckboxChange = (option, checked) => {
    let nextSelectedCategoriesAndGears = selectedCategoriesAndGears ? [...selectedCategoriesAndGears] : []
    let listToConcat = []
    switch (option) {
      case REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS: {
        listToConcat = groupsToCategories[1]
        break
      }
      case REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS: {
        listToConcat = groupsToCategories[2]
        break
      }
      case REGULATORY_GEAR_KEYS.ALL_GEARS: {
        listToConcat = Object.keys(categoriesToGears)
        break
      }
    }

    if (checked) {
      const set = new Set(nextSelectedCategoriesAndGears.concat(listToConcat))
      nextSelectedCategoriesAndGears = Array.from(set.values())
    } else {
      nextSelectedCategoriesAndGears = nextSelectedCategoriesAndGears.filter(value => !listToConcat.includes(value))
    }
    set(REGULATORY_GEAR_KEYS.SELECTED_GEARS_AND_CATEGORIES, nextSelectedCategoriesAndGears)
  }

  const set = useCallback((key, value) => {
    const obj = {
      ...regulatoryGears,
      [key]: value
    }
    setRegulatoryGears(obj)
  }, [regulatoryGears, setRegulatoryGears])

  const isCategory = useCallback(value => {
    return categoriesToGears && Object.keys(categoriesToGears).includes(value)
  }, [categoriesToGears])

  const updateRegulatedGearsAndCategories = () => {
    if (categoriesToGears && groupsToCategories) {
      const currentRegulatedGears = Object.keys(regulatedGears)
      const currentRegulatedGearCategories = Object.keys(regulatedGearCategories)
      const nextRegulatedGears = {}
      const nextRegulatedGearCategories = {}
      let towedGearCategories = 0
      let passiveGearCategories = 0
      let categories = 0

      selectedCategoriesAndGears.forEach(value => {
        if (isCategory(value)) {
          if (currentRegulatedGearCategories.includes(value)) {
            nextRegulatedGearCategories[value] = { ...regulatedGearCategories[value] }
          } else {
            nextRegulatedGearCategories[value] = { name: value }
          }
          if (groupsToCategories[1].includes(value)) {
            towedGearCategories += 1
          } else if (groupsToCategories[2].includes(value)) {
            passiveGearCategories += 1
          }
          categories += 1
        } else {
          if (currentRegulatedGears.includes(value)) {
            nextRegulatedGears[value] = { ...regulatedGears[value] }
          } else {
            nextRegulatedGears[value] = gearsByCode[value]
          }
        }
      })

      const obj = {
        ...regulatoryGears,
        [REGULATORY_GEAR_KEYS.ALL_GEARS]: categories === Object.keys(categoriesToGears).length,
        [REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS]: towedGearCategories === groupsToCategories[1].length,
        [REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS]: passiveGearCategories === groupsToCategories[2].length,
        [REGULATORY_GEAR_KEYS.REGULATED_GEARS]: nextRegulatedGears,
        [REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES]: nextRegulatedGearCategories
      }

      setRegulatoryGears(obj)
    }
  }

  useEffect(() => {
    if (selectedCategoriesAndGears) {
      updateRegulatedGearsAndCategories()
    }
  }, [selectedCategoriesAndGears])

  const removeGearOrCategory = (gearOrCategory) => {
    set(REGULATORY_GEAR_KEYS.SELECTED_GEARS_AND_CATEGORIES, selectedCategoriesAndGears.filter(value => value !== gearOrCategory))
  }

  const setRegulatedGear = (key, value, gearCode) => {
    const nextRegulatedGears = {
      ...regulatedGears,
      [gearCode]: {
        ...regulatedGears[gearCode],
        [key]: value
      }
    }
    set(REGULATORY_GEAR_KEYS.REGULATED_GEARS, nextRegulatedGears)
  }

  const setRegulatedGearCategory = (key, value, category) => {
    const nextRegulatedGearCategories = {
      ...regulatedGearCategories,
      [category]: {
        ...regulatedGearCategories[category],
        [key]: value
      }
    }
    set(REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES, nextRegulatedGearCategories)
  }

  return <FormSection show={show}>
    <RegulatorySectionTitle>
      <AuthorizedRadio
        inline
        onChange={value => set(REGULATORY_GEAR_KEYS.AUTHORIZED, value)}
        value={authorized}
      >
        Engins
        <CustomRadio
          data-cy={'regulation-authorized-gears'}
          checked={authorized}
          value={true} >
          autorisés
          <GreenCircle />
        </CustomRadio>
        <CustomRadio
          data-cy={'regulation-forbidden-gears'}
          checked={authorized === false}
          value={false} >
          interdits
          <RedCircle />
        </CustomRadio>
      </AuthorizedRadio>
    </RegulatorySectionTitle>
    <Delimiter width='523' />
    <FormContent
      authorized={authorized}
      display={authorized !== undefined}
      data-cy={'gears-section-content'}
    >
      {!authorized && <GearCheckBox
        data-cy={'all-gears-option'}
        value={REGULATORY_GEAR_KEYS.ALL_GEARS}
        onChange={onCheckboxChange}
        checked={allGears}
      >
        Tous les engins
      </GearCheckBox>}
      <CheckboxWrapper>
        <GearCheckBox
          data-cy={'all-towed-gears-option'}
          value={REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS}
          onChange={onCheckboxChange}
          checked={allTowedGears}
        >
          Engins trainants
        </GearCheckBox>
        <InfoBox><InfoText>{INFO_TEXT.TOWED_GEAR}</InfoText></InfoBox>
      </CheckboxWrapper>
      <CheckboxWrapper>
        <GearCheckBox
          data-cy={'all-passive-gears-option'}
          value={REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS}
          onChange={onCheckboxChange}
          checked={allPassiveGears}
        >
          Engins dormants
        </GearCheckBox>
        <InfoBox><InfoText>{INFO_TEXT.PASSIVE_GEAR}</InfoText></InfoBox>
      </CheckboxWrapper>
      <CustomMultiCascader
        data-cy='gears-selector'
        data={allCategoriesAndGears}
        style={{ width: 130 }}
        menuWidth={250}
        searchable={true}
        cleanable={false}
        placeholder='Choisir un ou des engins'
        renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
        onChange={values => set(REGULATORY_GEAR_KEYS.SELECTED_GEARS_AND_CATEGORIES, values)}
        value={selectedCategoriesAndGears || []}
        placement='autoVerticalStart'
      />
      {(Object.keys(regulatedGears)?.length > 0 || Object.keys(regulatedGearCategories)?.length > 0)
        ? <GearList>
        {
          Object.keys(regulatedGears).map((gearCode, index) => {
            return <GearLine
                key={index}
                id={index}
                label={regulatedGears[gearCode].name}
                allowMesh={GEARS_CATEGORES_WITH_MESH.includes(regulatedGears[gearCode].category)}
                code={gearCode}
                onChange={(key, value) => setRegulatedGear(key, value, gearCode)}
                meshType={regulatedGears[gearCode].meshType}
                mesh={regulatedGears[gearCode].mesh}
                onCloseIconClicked={_ => removeGearOrCategory(gearCode)}
              />
          })
        }
        {
          Object.keys(regulatedGearCategories).map((category, index) => {
            return <GearLine
              key={index}
              id={index}
              label={category}
              allowMesh={GEARS_CATEGORES_WITH_MESH.includes(category)}
              onChange={(key, value) => setRegulatedGearCategory(key, value, category)}
              meshType={regulatedGearCategories[category].meshType}
              mesh={regulatedGearCategories[category].mesh}
              onCloseIconClicked={_ => removeGearOrCategory(category)}
            />
          })
        }
        </GearList>
        : null
      }
      {!authorized && <DerogationRadioWrapper>
        <DerogationRadio
          inline
          onChange={value => set(REGULATORY_GEAR_KEYS.DEROGATION, value)}
          value={derogation}
          $isYellow={derogation}
        >
          <Text>{'Mesures dérogatoires'}</Text>
          <CustomRadio value={true} >oui</CustomRadio>
          <CustomRadio value={false} >non</CustomRadio>
        </DerogationRadio>
      </DerogationRadioWrapper>}
    </FormContent>
  </FormSection>
}

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const InfoText = styled.span`
  padding-left: 6px;
  white-space: nowrap;
`

const GearList = styled.div`
  padding-top: 20px;
`

const MultiCascaderLabel = styled.span`
  font-size: 11px;
  color: ${COLORS.slateGray};
`

const CustomMultiCascader = styled(MultiCascader)`
  .rs-checkbox-checker {
    font-size: 11px;
    color: ${COLORS.charcoal};
  }
`

const GearCheckBox = styled(CustomCheckbox)`
  padding-right: 11px;
  margin-bottom: 15px;
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

const DerogationRadioWrapper = styled.div`
  padding-top: 15px;
`
const DerogationRadio = styled(RadioGroup)` 
  ${customRadioGroup}
  padding-right: 10px!important;
  border: 1.5px solid ${props => props.$isYellow ? COLORS.yellow : COLORS.lightGray}!important;
  :focus {
    border: 1.5px solid ${props => props.$isYellow ? COLORS.yellow : COLORS.lightGray}!important;
  }
`

const Text = styled.p`
  font-size: 13px;
  color: ${COLORS.slateGray};
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

export default RegulatoryGearForm
