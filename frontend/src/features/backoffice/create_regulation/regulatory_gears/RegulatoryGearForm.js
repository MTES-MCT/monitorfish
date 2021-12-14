import React, { useCallback, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, RadioGroup, CheckboxGroup, MultiCascader } from 'rsuite'
import GearLine from './GearLine'

const REGULATORY_GEAR_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_GROUPS: 'allGroups',
  ALL_GEARS: 'allGears',
  ALL_TOWED_GEARS: 'allTowedGears',
  ALL_PASSIVE_GEARS: 'allPassiveGears',
  REGULATED_GEARS: 'regulatedGears',
  REGULATED_GEAR_CATEGORIES: 'regulatedGearCategories'
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
    allGroups
  } = regulatoryGears

  const { categoriesToGears, groupsToCategories } = useSelector(state => state.gear)

  const [multiCascaderValues, setMultiCascaderValues] = useState([])
  const [allCategoriesAndGears, setAllCategoriesAndGears] = useState([])

  const updateSelectedGearsAndGroups = () => {
    if (allGroups && Object.keys(allGroups).length > 0) {
      let newMultiCascaderValues = [...multiCascaderValues]
      if (allGroups.includes(REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS)) {
        newMultiCascaderValues = newMultiCascaderValues.concat(groupsToCategories[1])
      } else {
        const allTowedGearCategories = groupsToCategories[1]
        if (regulatedGearCategories) {
          newMultiCascaderValues = newMultiCascaderValues.concat(allTowedGearCategories
            .filter(category => regulatedGearCategories.includes(category)))
        } else {
          newMultiCascaderValues.filter(category => !allTowedGearCategories.includes(category))
        }
      }
      if (allGroups.includes(REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS)) {
        newMultiCascaderValues = newMultiCascaderValues.concat(groupsToCategories[2])
      } else {
        const allPassivesGearCategories = groupsToCategories[2]
        if (regulatedGearCategories) {
          newMultiCascaderValues = newMultiCascaderValues.concat(allPassivesGearCategories
            .filter(category => regulatedGearCategories.includes(category)))
        } else {
          newMultiCascaderValues.filter(category => !allPassivesGearCategories.includes(category))
        }
      }
      if (allGroups.includes(REGULATORY_GEAR_KEYS.ALL_GEARS)) {
        newMultiCascaderValues = Object.keys(categoriesToGears)
      } else {
        newMultiCascaderValues = Object.keys(categoriesToGears)
          .filter(category => !regulatedGearCategories.includes(category))
      }
      setMultiCascaderValues(newMultiCascaderValues)
    }
  }

  useEffect(() => {
    console.log('allGroups has changed')
    updateSelectedGearsAndGroups()
  }, [allGroups, categoriesToGears, groupsToCategories, setMultiCascaderValues])

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

  useEffect(() => {
    makeSelectList()
    setMultiCascaderValues(Object.keys(regulatedGears).concat(Object.keys(regulatedGearCategories)))
  }, [])

  const set = useCallback((key, value) => {
    const obj = {
      ...regulatoryGears,
      [key]: value
    }
    setRegulatoryGears(obj)
  }, [regulatoryGears, setRegulatoryGears])

  const isCategory = useCallback(value => {
    if (Object.keys(categoriesToGears).includes(value)) {
      return true
    }
    return false
  }, [categoriesToGears])

  const updateRegulatedGearsAndCategories = () => {
    const currentRegulatedGears = Object.keys(regulatedGears)
    const currentRegulatedGearCategories = Object.keys(regulatedGearCategories)
    const nextRegulatedGears = {}
    const nextRegulatedGearCategories = {}
    multiCascaderValues.forEach(value => {
      if (isCategory(value)) {
        if (currentRegulatedGearCategories.includes(value)) {
          nextRegulatedGearCategories[value] = { ...regulatedGearCategories[value] }
        } else {
          nextRegulatedGearCategories[value] = {}
        }
      } else {
        if (currentRegulatedGears.includes(value)) {
          nextRegulatedGears[value] = { ...regulatedGears[value] }
        } else {
          nextRegulatedGears[value] = { ...categoriesToGears[value] }
        }
      }
    })
    const obj = {
      ...regulatoryGears,
      regulatedGears: nextRegulatedGears,
      regulatedGearCategories: nextRegulatedGearCategories
    }
    setRegulatoryGears(obj)
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
        <CustomRadio checked={authorized} value={true} >
          autorisées
          <GreenCircle />
        </CustomRadio>
        <CustomRadio checked={authorized === false} value={false} >
          interdites
          <RedCircle />
        </CustomRadio>
      </AuthorizedRadio>
    </Title>
    <Content authorized={authorized} display={authorized !== undefined}>
      <CheckboxGroup
        value={allGroups}
        onChange={(value, event) => {
          console.log(event)
          set(REGULATORY_GEAR_KEYS.ALL_GROUPS, [...value])
        }}
      >
        {!authorized && <GearCheckBox
          value={REGULATORY_GEAR_KEYS.ALL_GEARS}
        >
          Tous les engins
        </GearCheckBox>}
        <GearCheckBox
          value={REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS}
        >
          Engins trainants
        </GearCheckBox>
        <GearCheckBox
          value={REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS}
        >
          Engins dormants
        </GearCheckBox>
      </CheckboxGroup>
      <CustomMultiCascader
        data={allCategoriesAndGears}
        style={{ width: 146 }}
        searchable={false}
        cleanable={false}
        placeholder={'Choisir un ou des engins'}
        renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
        onChange={setMultiCascaderValues}
        value={multiCascaderValues}
      />
      <GearList>
      {
        Object.keys(regulatedGears).map((gearCode, index) => {
          return <GearLine
              key={index}
              id={index}
              label={regulatedGears[gearCode].label}
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
          return (<GearLine
              key={index}
              id={index}
              label={category}
              onChange={(key, value) => setRegulatedGearCategory(key, value, category)}
              intervalType={regulatedGearCategories[category].intervalType}
              intervalValues={regulatedGearCategories[category].intervalValues}
              onCloseIconClicked={_ => removeGearOrCategory(category)}
            />
          )
        })
      }
      </GearList>
    </Content>
  </Wrapper>
}

const GearList = styled.div`
  padding: 20px 0 15px 0;
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

export default RegulatoryGearForm
