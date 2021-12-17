import React, { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, RadioGroup, MultiCascader } from 'rsuite'
import GearLine from './GearLine'
import getAllGearCodes from '../../../../domain/use_cases/getAllGearCodes'
import { GEARS_CATEGORES_WITH_MESH } from '../../../../domain/entities/regulatory'

const REGULATORY_GEAR_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_GEARS: 'allGears',
  ALL_TOWED_GEARS: 'allTowedGears',
  ALL_PASSIVE_GEARS: 'allPassiveGears',
  REGULATED_GEARS: 'regulatedGears',
  REGULATED_GEAR_CATEGORIES: 'regulatedGearCategories',
  DEROGATION: 'derogation'
}

const RegulatoryGearForm = (props) => {
  const {
    regulatoryGears,
    setRegulatoryGears,
    show
  } = props

  const {
    regulatedGears,
    regulatedGearCategories,
    authorized,
    allGears,
    allTowedGears,
    allPassiveGears,
    derogation
  } = regulatoryGears

  const dispatch = useDispatch()

  const { categoriesToGears, groupsToCategories, gearsByCode } = useSelector(state => state.gear)

  const [multiCascaderValues, setMultiCascaderValues] = useState([].concat([...Object.keys(regulatedGears), ...Object.keys(regulatedGearCategories)]))
  const [allCategoriesAndGears, setAllCategoriesAndGears] = useState([])

  useEffect(() => {
    if (!categoriesToGears || !groupsToCategories || gearsByCode) {
      dispatch(getAllGearCodes())
    }
  }, [])

  useEffect(() => {
    if (categoriesToGears) {
      makeSelectList()
    }
  }, [categoriesToGears])

  useEffect(() => {
    if (multiCascaderValues?.length > 0) {
      const categories = []
      const gears = []
      multiCascaderValues.forEach(value => {
        if (isCategory) {
          categories.push(value)
        } else {
          gears.push(value)
        }
      })
      set(REGULATORY_GEAR_KEYS.REGULATED_GEARS, gears)
      set(REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES, categories)
    }
  }, [multiCascaderValues])

  const onCheckboxChange = (option, checked) => {
    let nextMultiCascaderValues = [...multiCascaderValues]
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
      const set = new Set(nextMultiCascaderValues.concat(listToConcat))
      nextMultiCascaderValues = Array.from(set.values())
    } else {
      nextMultiCascaderValues = nextMultiCascaderValues.filter(value => !listToConcat.includes(value))
    }
    setMultiCascaderValues(nextMultiCascaderValues)
  }

  const makeSelectList = () => {
    const list = Object.keys(categoriesToGears).map((category) => {
      const children = categoriesToGears[category].map((gear) => {
        return {
          label: gear.name,
          value: gear.code
        }
      })
      return {
        label: category,
        value: category,
        children
      }
    })
    setAllCategoriesAndGears(list)
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

      multiCascaderValues.forEach(value => {
        if (isCategory(value)) {
          if (currentRegulatedGearCategories.includes(value)) {
            nextRegulatedGearCategories[value] = { ...regulatedGearCategories[value] }
          } else {
            nextRegulatedGearCategories[value] = {}
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
    updateRegulatedGearsAndCategories()
  }, [multiCascaderValues])

  const removeGearOrCategory = (gearOrCategory) => {
    const nextMulticascaderValues = multiCascaderValues.filter(value => value !== gearOrCategory)
    setMultiCascaderValues(nextMulticascaderValues)
  }

  const setRegulatedGear = (key, value, gear) => {
    const nextRegulatedGears = {
      ...regulatedGears,
      [gear]: {
        ...regulatedGears[gear],
        [key]: value
      }
    }
    set(REGULATORY_GEAR_KEYS.REGULATED_GEARS, nextRegulatedGears)
  }

  const setRegulatedGearCategory = (key, value, category) => {
    const nextRegulatedGearCategories = {
      ...regulatedGearCategories,
      [category]: {
        ...regulatedGears[category],
        [key]: value
      }
    }
    set(REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES, nextRegulatedGearCategories)
  }

  return <Wrapper show={show}>
    <Title>
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
          autorisées
          <GreenCircle />
        </CustomRadio>
        <CustomRadio
          data-cy={'regulation-forbidden-gears'}
          checked={authorized === false}
          value={false} >
          interdites
          <RedCircle />
        </CustomRadio>
      </AuthorizedRadio>
    </Title>
    <Content
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
      <GearCheckBox
        value={REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS}
        onChange={onCheckboxChange}
        checked={allTowedGears}
        data-cy={'all-towed-gears-option'}
      >
        Engins trainants
      </GearCheckBox>
      <GearCheckBox
        data-cy={'all-passive-gears-option'}
        value={REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS}
        onChange={onCheckboxChange}
        checked={allPassiveGears}
      >
        Engins dormants
      </GearCheckBox>
      <CustomMultiCascader
        data-cy={'gears-selector'}
        data={allCategoriesAndGears}
        style={{ width: 146 }}
        searchable={false}
        cleanable={false}
        placeholder={'Choisir un ou des engins'}
        renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
        onChange={setMultiCascaderValues}
        value={multiCascaderValues}
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
                intervalType={regulatedGears[gearCode].intervalType}
                intervalValues={regulatedGears[gearCode].intervalValues}
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
              intervalType={regulatedGearCategories[category].intervalType}
              intervalValues={regulatedGearCategories[category].intervalValues}
              onCloseIconClicked={_ => removeGearOrCategory(category)}
            />
          })
        }
        </GearList>
        : null
      }
      {!authorized && <DerogationRadio
        inline
        onChange={value => set(REGULATORY_GEAR_KEYS.DEROGATION, value)}
        value={derogation}
      >
        <Text>{'Mesure dérogatoire'}</Text>
        <CustomRadio checked={authorized} value={true} >
          oui
          <GreenCircle />
        </CustomRadio>
        <CustomRadio checked={authorized === false} value={false} >
          non
          <RedCircle />
        </CustomRadio>
      </DerogationRadio>}
    </Content>
  </Wrapper>
}

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
  margin-bottom: 15px;
`

const Content = styled.div`
  display: ${props => !props.display ? 'none' : 'flex'};
  flex-direction: column;
  align-items: flex-start;
  padding-left: 15px;
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
`

const Wrapper = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
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

const customRadioGroup = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const DerogationRadio = styled(RadioGroup)` 
  ${customRadioGroup}
  padding-top: 15px!important;
`

const Text = styled.p`
  font-size: 13px;
  color: ${COLORS.slateGray};
`

const AuthorizedRadio = styled(RadioGroup)` 
  ${customRadioGroup}
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
