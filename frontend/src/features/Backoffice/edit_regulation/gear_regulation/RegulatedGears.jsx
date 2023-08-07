import React, { useCallback, useEffect } from 'react'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import {
  CustomCheckbox,
  customRadioGroup,
  Delimiter,
  FormContent,
  FormSection,
  RegulatorySectionTitle
} from '../../../commonStyles/Backoffice.style'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { MultiCascader, Radio, RadioGroup } from 'rsuite'
import RegulatedGear from './RegulatedGear'
import { GEARS_CATEGORIES_WITH_MESH } from '../../../../domain/entities/regulation'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { getGroupCategories, REGULATED_GEARS_KEYS } from '../../../../domain/entities/backoffice'

const RegulatedGears = props => {
  const {
    regulatedGearsObject,
    setRegulatedGearsObject,
    show,
    authorized,
    formattedAndFilteredCategoriesToGears
  } = props

  const {
    /** @type {Gear[]} */
    regulatedGears,
    /** @type {GearCategory[]} */
    regulatedGearCategories,
    /** @type {string[]} */
    selectedCategoriesAndGears,
    allGears,
    allTowedGears,
    allPassiveGears,
    derogation
  } = regulatedGearsObject

  const {
    categoriesToGears,
    groupsToCategories,
    gearsByCode
  } = useSelector(state => state.gear)

  const onCheckboxChange = (groupName, checked) => {
    let nextSelectedCategoriesAndGears = selectedCategoriesAndGears ? [...selectedCategoriesAndGears] : []
    const gearsListToConcatOrFilter = getGroupCategories(groupName, groupsToCategories)

    if (checked) {
      const set = new Set(nextSelectedCategoriesAndGears.concat(gearsListToConcatOrFilter))
      nextSelectedCategoriesAndGears = Array.from(set.values())
    } else {
      nextSelectedCategoriesAndGears = nextSelectedCategoriesAndGears.filter(value => !gearsListToConcatOrFilter.includes(value))
    }

    set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, nextSelectedCategoriesAndGears)
  }

  const set = useCallback((key, value) => {
    setRegulatedGearsObject(authorized, {
      ...regulatedGearsObject,
      [key]: value
    })
  }, [regulatedGearsObject, authorized, setRegulatedGearsObject])

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

          if (groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS].includes(value)) {
            towedGearCategories += 1
          } else if (groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS].includes(value)) {
            passiveGearCategories += 1
          }

          categories += 1
        } else {
          if (currentRegulatedGears.includes(value)) {
            nextRegulatedGears[value] = { ...regulatedGears[value] }
          } else if (gearsByCode[value]) {
            nextRegulatedGears[value] = gearsByCode[value]
          }
        }
      })

      const nextRegulatedGearsObject = {
        ...regulatedGearsObject,
        [REGULATED_GEARS_KEYS.ALL_GEARS]: formattedAndFilteredCategoriesToGears.length > 0 && categories === formattedAndFilteredCategoriesToGears.length,
        [REGULATED_GEARS_KEYS.ALL_TOWED_GEARS]: towedGearCategories === groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS].length,
        [REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS]: passiveGearCategories === groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS].length,
        [REGULATED_GEARS_KEYS.REGULATED_GEARS]: nextRegulatedGears,
        [REGULATED_GEARS_KEYS.REGULATED_GEAR_CATEGORIES]: nextRegulatedGearCategories
      }

      if (!_.isEqual(nextRegulatedGearsObject, regulatedGearsObject)) {
        setRegulatedGearsObject(authorized, nextRegulatedGearsObject)
      }
    }
  }

  useEffect(() => {
    if (selectedCategoriesAndGears) {
      updateRegulatedGearsAndCategories()
    }
  }, [selectedCategoriesAndGears])

  const removeGearOrCategory = gearOrCategory => {
    set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, selectedCategoriesAndGears.filter(value => value !== gearOrCategory))
  }

  const setRegulatedGears = (key, value, gearCode) => {
    const nextRegulatedGears = {
      ...regulatedGears,
      [gearCode]: {
        ...regulatedGears[gearCode],
        [key]: value
      }
    }

    set(REGULATED_GEARS_KEYS.REGULATED_GEARS, nextRegulatedGears)
  }

  const setRegulatedGearCategory = (key, value, category) => {
    const nextRegulatedGearCategories = {
      ...regulatedGearCategories,
      [category]: {
        ...regulatedGearCategories[category],
        [key]: value
      }
    }

    set(REGULATED_GEARS_KEYS.REGULATED_GEAR_CATEGORIES, nextRegulatedGearCategories)
  }

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return <FormSection show={show}>
    <RegulatorySectionTitle>
      {
        authorized
          ? <GreenCircle margin={'0 6px'} />
          : <RedCircle margin={'0 6px'} />
      }
      Engins { authorized ? 'autorisés' : 'interdits'}
    </RegulatorySectionTitle>
    <Delimiter width='523' />
    <FormContent
      authorized={authorized}
      display={authorized !== undefined}
      data-cy={`${dataCyTarget}-gears-section-content`}
    >
      {!authorized && <GearCheckBox
        data-cy={`${dataCyTarget}-all-gears-option`}
        value={REGULATED_GEARS_KEYS.ALL_GEARS}
        onChange={onCheckboxChange}
        checked={allGears}
      >
        Tous les engins
      </GearCheckBox>}
      <CheckboxWrapper>
        <GearCheckBox
          data-cy={`${dataCyTarget}-all-towed-gears-option`}
          value={REGULATED_GEARS_KEYS.ALL_TOWED_GEARS}
          onChange={onCheckboxChange}
          checked={allTowedGears}
        >
          Engins trainants
        </GearCheckBox>
        <InfoBox pointer><InfoText>{INFO_TEXT.TOWED_GEAR}</InfoText></InfoBox>
      </CheckboxWrapper>
      <CheckboxWrapper>
        <GearCheckBox
          data-cy={`${dataCyTarget}-all-passive-gears-option`}
          value={REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS}
          onChange={onCheckboxChange}
          checked={allPassiveGears}
        >
          Engins dormants
        </GearCheckBox>
        <InfoBox pointer><InfoText>{INFO_TEXT.PASSIVE_GEAR}</InfoText></InfoBox>
      </CheckboxWrapper>
      <CustomMultiCascader
        data-cy={`${dataCyTarget}-gears-selector`}
        data={formattedAndFilteredCategoriesToGears}
        style={{ width: 200 }}
        menuWidth={250}
        searchable={true}
        cleanable={false}
        placeholder='Choisir un ou des engins'
        renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
        onChange={values => set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, values)}
        value={selectedCategoriesAndGears || []}
        placement='autoVerticalStart'
        onSelect={(item, activePaths) => {
          if (activePaths.length !== 2) {
            return
          }

          if (!selectedCategoriesAndGears?.find(value => value === item.value)) {
            set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, selectedCategoriesAndGears.concat(item.value))
          }

          if (selectedCategoriesAndGears?.find(value => value === item.value)) {
            set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, selectedCategoriesAndGears.filter(tag => tag !== item.value))
          }
        }}
      />
      {(Object.keys(regulatedGears)?.length > 0 || Object.keys(regulatedGearCategories)?.length > 0)
        ? <GearList>
        {
          Object.keys(regulatedGears).map((gearCode, index) => {
            return <RegulatedGear
                key={gearCode + index}
                id={index}
                label={regulatedGears[gearCode].name}
                allowMesh={GEARS_CATEGORIES_WITH_MESH.includes(regulatedGears[gearCode].category)}
                code={gearCode}
                onChange={(key, value) => setRegulatedGears(key, value, gearCode)}
                meshType={regulatedGears[gearCode].meshType}
                mesh={regulatedGears[gearCode].mesh}
                remarks={regulatedGears[gearCode].remarks}
                onCloseIconClicked={_ => removeGearOrCategory(gearCode)}
              />
          })
        }
        {
          Object.keys(regulatedGearCategories).map((category, index) => {
            return <RegulatedGear
              key={category + index}
              id={index}
              label={category}
              allowMesh={GEARS_CATEGORIES_WITH_MESH.includes(category)}
              onChange={(key, value) => setRegulatedGearCategory(key, value, category)}
              meshType={regulatedGearCategories[category].meshType}
              mesh={regulatedGearCategories[category].mesh}
              remarks={regulatedGearCategories[category].remarks}
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
          onChange={value => set(REGULATED_GEARS_KEYS.DEROGATION, value)}
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
  a {
    box-sizing: border-box;
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .rs-checkbox-checker {
    font-size: 11px;
    color: ${COLORS.charcoal};
  }
`

const GearCheckBox = styled(CustomCheckbox)`
  padding-right: 11px;
  margin-bottom: 15px;
`

const DerogationRadioWrapper = styled.div`
  padding-top: 15px;
`
const DerogationRadio = styled(RadioGroup)`
  ${customRadioGroup}
  padding-right: 10px!important;
  border: 1.5px solid ${props => props.$isYellow ? props.theme.color.goldenPoppy : props.theme.color.lightGray}!important;
  :focus {
    border: 1.5px solid ${props => props.$isYellow ? props.theme.color.goldenPoppy : props.theme.color.lightGray}!important;
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

export default RegulatedGears
