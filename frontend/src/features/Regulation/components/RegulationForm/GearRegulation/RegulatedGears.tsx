import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import { type CheckboxProps, MultiCascader, Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { RegulatedGear } from './RegulatedGear'
import { getGroupCategories, REGULATED_GEARS_KEYS } from '../../../../../domain/entities/backoffice'
import {
  CustomCheckbox,
  customRadioGroup,
  Delimiter,
  FormContent,
  FormSection,
  RegulatorySectionTitle
} from '../../../../commonStyles/Backoffice.style'
import { GreenCircle, RedCircle } from '../../../../commonStyles/Circle.style'
import { GEARS_CATEGORIES_WITH_MESH } from '../../../utils'
import { INFO_TEXT } from '../../RegulationTables/constants'
import { InfoBox } from '../InfoBox'

import type { RegulatedGears as RegulatedGearsType } from '@features/Regulation/types'

type RegulatedGearsProps = Readonly<{
  authorized: boolean
  formattedAndFilteredCategoriesToGears: any[]
  regulatedGearsObject: RegulatedGearsType
  setRegulatedGearsObject: (isAuthorized: boolean, regulatedGearsObject: any) => void
  show: boolean
}>
export function RegulatedGears({
  authorized,
  formattedAndFilteredCategoriesToGears,
  regulatedGearsObject,
  setRegulatedGearsObject,
  show
}: RegulatedGearsProps) {
  const {
    allGears,
    allPassiveGears,
    allTowedGears,
    derogation,
    regulatedGearCategories,
    regulatedGears,
    selectedCategoriesAndGears
  } = regulatedGearsObject

  const categoriesToGears = useBackofficeAppSelector(state => state.gear.categoriesToGears)
  const gearsByCode = useBackofficeAppSelector(state => state.gear.gearsByCode)
  const groupsToCategories = useBackofficeAppSelector(state => state.gear.groupsToCategories)

  const onCheckboxChange = (groupName: REGULATED_GEARS_KEYS | undefined, checked: boolean) => {
    if (!groupName) {
      return
    }

    let nextSelectedCategoriesAndGears = selectedCategoriesAndGears ? [...selectedCategoriesAndGears] : []
    const gearsListToConcatOrFilter = getGroupCategories(groupName, groupsToCategories)

    if (checked) {
      const set = new Set(nextSelectedCategoriesAndGears.concat(gearsListToConcatOrFilter))
      nextSelectedCategoriesAndGears = Array.from(set.values())
    } else {
      nextSelectedCategoriesAndGears = nextSelectedCategoriesAndGears.filter(
        value => !gearsListToConcatOrFilter.includes(value)
      )
    }

    set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, nextSelectedCategoriesAndGears)
  }

  const set = useCallback(
    (key, value) => {
      setRegulatedGearsObject(authorized, {
        ...regulatedGearsObject,
        [key]: value
      })
    },
    [regulatedGearsObject, authorized, setRegulatedGearsObject]
  )

  const isCategory = useCallback(
    value => categoriesToGears && Object.keys(categoriesToGears).includes(value),
    [categoriesToGears]
  )

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

          if (groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS]?.includes(value)) {
            towedGearCategories += 1
          } else if (groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS]?.includes(value)) {
            passiveGearCategories += 1
          }

          categories += 1
        } else if (currentRegulatedGears.includes(value)) {
          nextRegulatedGears[value] = { ...regulatedGears[value] }
        } else if (gearsByCode && gearsByCode[value]) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { isMeshRequiredForSegment, ...valueWithoutProperty } = gearsByCode[value]

          nextRegulatedGears[value] = valueWithoutProperty
        }
      })

      const nextRegulatedGearsObject = {
        ...regulatedGearsObject,
        [REGULATED_GEARS_KEYS.ALL_GEARS]:
          formattedAndFilteredCategoriesToGears.length > 0 &&
          categories === formattedAndFilteredCategoriesToGears.length,
        [REGULATED_GEARS_KEYS.ALL_TOWED_GEARS]:
          towedGearCategories === groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS]?.length,
        [REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS]:
          passiveGearCategories === groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS]?.length,
        [REGULATED_GEARS_KEYS.REGULATED_GEARS]: nextRegulatedGears,
        [REGULATED_GEARS_KEYS.REGULATED_GEAR_CATEGORIES]: nextRegulatedGearCategories
      }

      if (!isEqual(nextRegulatedGearsObject, regulatedGearsObject)) {
        setRegulatedGearsObject(authorized, nextRegulatedGearsObject)
      }
    }
  }

  useEffect(
    () => {
      if (selectedCategoriesAndGears) {
        updateRegulatedGearsAndCategories()
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCategoriesAndGears]
  )

  const removeGearOrCategory = gearOrCategory => {
    set(
      REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES,
      selectedCategoriesAndGears.filter(value => value !== gearOrCategory)
    )
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

  return (
    <FormSection $show={show}>
      <RegulatorySectionTitle>
        {authorized ? <GreenCircle $margin="0 6px" /> : <RedCircle $margin="0 6px" />}
        Engins {authorized ? 'autorisés' : 'interdits'}
      </RegulatorySectionTitle>
      <Delimiter width={523} />
      <FormContent $display={authorized !== undefined} data-cy={`${dataCyTarget}-gears-section-content`}>
        {!authorized && (
          <GearCheckBox
            checked={allGears}
            data-cy={`${dataCyTarget}-all-gears-option`}
            onChange={onCheckboxChange}
            value={REGULATED_GEARS_KEYS.ALL_GEARS}
          >
            Tous les engins
          </GearCheckBox>
        )}
        <CheckboxWrapper>
          <GearCheckBox
            checked={allTowedGears}
            data-cy={`${dataCyTarget}-all-towed-gears-option`}
            onChange={onCheckboxChange}
            value={REGULATED_GEARS_KEYS.ALL_TOWED_GEARS}
          >
            Engins trainants
          </GearCheckBox>
          <InfoBox pointer>
            <InfoText>{INFO_TEXT.TOWED_GEAR}</InfoText>
          </InfoBox>
        </CheckboxWrapper>
        <CheckboxWrapper>
          <GearCheckBox
            checked={allPassiveGears}
            data-cy={`${dataCyTarget}-all-passive-gears-option`}
            onChange={onCheckboxChange}
            value={REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS}
          >
            Engins dormants
          </GearCheckBox>
          <InfoBox pointer>
            <InfoText>{INFO_TEXT.PASSIVE_GEAR}</InfoText>
          </InfoBox>
        </CheckboxWrapper>
        <CustomMultiCascader
          $valueIsMissing={false}
          cleanable={false}
          data={formattedAndFilteredCategoriesToGears}
          data-cy={`${dataCyTarget}-gears-selector`}
          menuWidth={250}
          onChange={values => set(REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES, values)}
          onSelect={(item, activePaths) => {
            if (activePaths.length !== 2) {
              return
            }

            if (!selectedCategoriesAndGears.find(value => value === item.value)) {
              set(
                REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES,
                selectedCategoriesAndGears.concat(item.value as any)
              )
            }

            if (selectedCategoriesAndGears.find(value => value === item.value)) {
              set(
                REGULATED_GEARS_KEYS.SELECTED_GEARS_AND_CATEGORIES,
                selectedCategoriesAndGears.filter(tag => tag !== item.value)
              )
            }
          }}
          placeholder="Choisir un ou des engins"
          placement="autoVerticalStart"
          renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
          searchable
          style={{ width: 200 }}
          value={selectedCategoriesAndGears || []}
        />
        {(Object.keys(regulatedGears).length > 0 || Object.keys(regulatedGearCategories).length > 0) && (
          <GearList>
            {Object.keys(regulatedGears).map((gearCode, index) => (
              <RegulatedGear
                // eslint-disable-next-line react/no-array-index-key
                key={gearCode + index}
                allowMesh={GEARS_CATEGORIES_WITH_MESH.includes(regulatedGears[gearCode]!.category)}
                code={gearCode}
                id={index}
                label={regulatedGears[gearCode]!.name}
                mesh={regulatedGears[gearCode]!.mesh}
                meshType={regulatedGears[gearCode]!.meshType}
                onChange={(key, value) => setRegulatedGears(key, value, gearCode)}
                onCloseIconClicked={() => removeGearOrCategory(gearCode)}
                remarks={regulatedGears[gearCode]!.remarks}
              />
            ))}
            {Object.keys(regulatedGearCategories).map((category, index) => (
              <RegulatedGear
                // eslint-disable-next-line react/no-array-index-key
                key={category + index}
                allowMesh={GEARS_CATEGORIES_WITH_MESH.includes(category)}
                id={index}
                label={category}
                mesh={regulatedGearCategories[category]!.mesh}
                meshType={regulatedGearCategories[category]!.meshType}
                onChange={(key, value) => setRegulatedGearCategory(key, value, category)}
                onCloseIconClicked={() => removeGearOrCategory(category)}
                remarks={regulatedGearCategories[category]!.remarks}
              />
            ))}
          </GearList>
        )}
        {!authorized && (
          <DerogationRadioWrapper>
            <DerogationRadio
              $isYellow={derogation}
              inline
              onChange={value => set(REGULATED_GEARS_KEYS.DEROGATION, value)}
              value={derogation as any}
            >
              <Text>Mesures dérogatoires</Text>
              <CustomRadio value={true as any}>oui</CustomRadio>
              <CustomRadio value={false as any}>non</CustomRadio>
            </DerogationRadio>
          </DerogationRadioWrapper>
        )}
      </FormContent>
    </FormSection>
  )
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
  color: ${p => p.theme.color.slateGray};
`

const CustomMultiCascader = styled(MultiCascader)<{
  $valueIsMissing: boolean | undefined
}>`
  a {
    box-sizing: border-box;
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .rs-checkbox-checker {
    font-size: 11px;
    color: ${p => p.theme.color.charcoal};
  }
`

const GearCheckBox = styled(CustomCheckbox)<any, CheckboxProps<REGULATED_GEARS_KEYS>>`
  padding-right: 11px;
`

const DerogationRadioWrapper = styled.div`
  padding-top: 15px;
`
const DerogationRadio = styled(RadioGroup)`
  ${customRadioGroup}
  padding: 10px !important;
  border: 1.5px solid ${p => (p.$isYellow ? p.theme.color.goldenPoppy : p.theme.color.lightGray)}!important;
  &:focus {
    border: 1.5px solid ${p => (p.$isYellow ? p.theme.color.goldenPoppy : p.theme.color.lightGray)}!important;
  }
`

const Text = styled.p`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
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
    color: ${p => p.theme.color.gunMetal};
  }
`
