import React, { useCallback, useState, useEffect } from 'react'
import { ContentLine, CustomCheckbox } from '../../../commonStyles/Backoffice.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, RadioGroup, CheckboxGroup, MultiCascader } from 'rsuite'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import Tag from '../Tag'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
// import CustomSelectComponent from '../custom_form/CustomSelectComponent'

const REGULATORY_GEAR_KEYS = {
  AUTHORIZED: 'authorized',
  ALL_GROUPS: 'allGroups',
  ALL_GEARS: 'allGears',
  ALL_TOWED_GEARS: 'allTowedGears',
  ALL_PASSIVE_GEARS: 'allPassiveGears',
  REGULATED_GEARS: 'regulatedGears',
  REGULATED_GEAR_CATEGORIES: 'regulatedGearCategories'
}

const GEAR_FROM_DB = {
  TMS: {
    label: 'blablabla',
    category: 'category1',
    group: 1
  },
  RDFF: {
    label: 'fldslf',
    category: 'category1',
    group: 1
  },
  PDM: {
    label: 'zdfa',
    category: 'category2',
    group: 2
  },
  ASR: {
    label: 'cncnc',
    category: 'category2',
    group: 2
  }
}

const REGULATORY_GEAR_EXAMPLE = [
  {
    value: 'category1',
    label: 'category1',
    children: [
      {
        value: 'TMS',
        label: 'blablabla'
      },
      {
        value: 'RDFF',
        label: 'fldslf'
      }
    ]
  },
  {
    value: 'category2',
    label: 'category2',
    children: [
      {
        value: 'PDM',
        label: 'zdfa'
      },
      {
        value: 'ASR',
        label: 'cncnc'
      }
    ]
  }
]

// const REGULATORY_GEAR_VALUE_EXAMPLE =  ['category3', 'ASR', 'TMS', 'RDFF']

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

  const [multiCascaderValues, setMultiCascaderValues] = useState([])

  useEffect(() => {
    if (regulatedGears || regulatedGearCategories) {
      setMultiCascaderValues([
        ...Object.keys(regulatedGears),
        ...Object.keys(regulatedGearCategories)
      ])
    }
  }, [regulatedGears, regulatedGearCategories])

  const set = useCallback((key, value) => {
    const obj = {
      ...regulatoryGears,
      [key]: value
    }

    setRegulatoryGears(obj)
  }, [regulatoryGears, setRegulatoryGears])

  const isCategory = useCallback(value => {
    if (!Object.keys(GEAR_FROM_DB).includes(value)) {
      return true
    }
    return false
  }, [REGULATORY_GEAR_EXAMPLE])

  const setRegulatoryGear = (values) => {
    const currentRegulatedGears = Object.keys(regulatedGears)
    const currentRegulatedGearCategories = Object.keys(regulatedGearCategories)
    const nextRegulatedGears = {}
    const nextRegulatedGearCategories = {}
    values.forEach(value => {
      if (isCategory(value)) {
        if (currentRegulatedGearCategories.includes(value)) {
          nextRegulatedGearCategories[value] = currentRegulatedGearCategories[value]
        } else {
          nextRegulatedGearCategories[value] = {}
        }
        set(REGULATORY_GEAR_KEYS.REGULATED_GEAR_CATEGORIES, nextRegulatedGearCategories)
      } else {
        if (currentRegulatedGears.includes(value)) {
          nextRegulatedGears[value] = currentRegulatedGears[value]
        } else {
          nextRegulatedGears[value] = { ...GEAR_FROM_DB[value] }
        }
        set(REGULATORY_GEAR_KEYS.REGULATED_GEARS, nextRegulatedGears)
      }
    })
  }

  const setRegulatedGear = (key, value, gear) => {
    const nextRegulatedGears = {
      ...regulatedGears,
      [gear]: {
        ...regulatedGears[gear],
        [key]: value
      }
    }
    set('regulatedGears', nextRegulatedGears)
  }

  const setRegulatedGearCategory = (key, value, category) => {
    const nextRegulatedGearCategories = {
      ...regulatedGearCategories,
      [category]: {
        ...regulatedGears[category],
        [key]: value
      }
    }
    set('regulatedGearCategories', nextRegulatedGearCategories)
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
    <Content display={authorized !== undefined}>
      <CheckboxGroup
        value={allGroups}
        onChange={value => set(REGULATORY_GEAR_KEYS.ALL_GROUPS, value)}
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
        data={REGULATORY_GEAR_EXAMPLE}
        style={{ width: 146 }}
        searchable={false}
        cleanable={false}
        placeholder={'Choisir un ou des engins'}
        renderValue={() => <MultiCascaderLabel>Choisir un ou des engins</MultiCascaderLabel>}
        onChange={setRegulatoryGear}
        value={multiCascaderValues}
      />
      {
        Object.keys(regulatedGears).map((value, index) =>
        <GearLine key={value} >
          <ContentLine>
            <Label>{`Engin ${index + 1}`}</Label>
            <Tag tagValue={`${regulatedGears[value].label} (${value})`}/>
          </ContentLine>
          <ContentLine>
            <Label>Maillage</Label>
            <CustomSelectComponent
              value={value.interval}
              onChange={meshInterval => setRegulatedGear('intervalMesh', meshInterval, value)}
              data={[{
                value: 'greaterThan',
                label: 'supérieur ou égal à'
              }, {
                value: 'between',
                label: 'entre'
              }]}
              valueIsMissing={false}
            />
            <><CustomInput
              width={'60px'}
              value={value.intervalValues ? value.intervalValues[0] : ''}
              onChange={intervalValue => {
                const nextIntervalValue = { ...value.intervalValues }
                nextIntervalValue[0] = intervalValue
                setRegulatedGear('intervalValues', nextIntervalValue, value)
              }} />mm</>
            {value.intervalValues?.length === 2 &&
              <>et <CustomInput
                width={'60px'}
                value={value.intervalValues[1]}
                onChange={intervalValue => setRegulatedGear('intervalValues', [...value.intervalValues, intervalValue], value)} />mm</>
            }
          </ContentLine>
        </GearLine>)
      }
      {
        Object.keys(regulatedGearCategories).map((value, index) =>
        <GearLine key={value} >
          <ContentLine>
            <Label>{`Type d'engin ${index + 1}`}</Label>
            <Tag tagValue={value}/>
          </ContentLine>
          <ContentLine>
            <Label>Maillage</Label>
            <CustomSelectComponent
              value={value.interval}
              onChange={meshInterval => setRegulatedGearCategory('intervalMesh', meshInterval, value)}
              data={[{
                value: 'greaterThan',
                label: 'supérieur ou égal à'
              }, {
                value: 'between',
                label: 'entre'
              }]}
              valueIsMissing={false}
            />
            <><CustomInput
              width={'60px'}
              value={value.intervalValues ? value.intervalValues[0] : ''}
              onChange={intervalValue => {
                const nextIntervalValue = { ...value.intervalValues }
                nextIntervalValue[0] = intervalValue
                setRegulatedGearCategory('intervalValues', nextIntervalValue, value)
              }} />mm</>
            {value.intervalValues?.length === 2 &&
              <>et <CustomInput
                width={'60px'}
                value={value.intervalValues[1]}
                onChange={intervalValue => setRegulatedGearCategory('intervalValues', [...value.intervalValues, intervalValue], value)} />mm</>
            }
          </ContentLine>
        </GearLine>)
      }
    </Content>
  </Wrapper>
}

const GearLine = styled.span``

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
