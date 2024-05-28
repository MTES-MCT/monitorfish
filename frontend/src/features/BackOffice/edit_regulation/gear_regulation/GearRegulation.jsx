import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import RegulatedGears from './RegulatedGears'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { Section, OtherRemark, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { updateProcessingRegulationByKeyAndSubKey } from '../../slice'
import {
  DEFAULT_AUTHORIZED_REGULATED_GEARS,
  DEFAULT_UNAUTHORIZED_REGULATED_GEARS,
  REGULATORY_REFERENCE_KEYS
} from '../../../Regulation/utils'
import { GEAR_REGULATION_KEYS, prepareCategoriesAndGearsToDisplay } from '../../../../domain/entities/backoffice'
import getAllGearCodes from '../../../../domain/use_cases/gearCode/getAllGearCodes'

const GearRegulation = () => {
  const dispatch = useDispatch()
  const { gearRegulation } = useSelector(state => state.regulation.processingRegulation)

  const {
    /** @type {Object.<string, Gear[]>} */
    categoriesToGears,
    groupsToCategories,
    gearsByCode
  } = useSelector(state => state.gear)

  const [show, setShow] = useState(false)
  /** @type {string[]} */
  const [formattedAndFilteredCategoriesToGears, setFormattedAndFilteredCategoriesToGears] = useState([])

  useEffect(() => {
    if (!categoriesToGears || !groupsToCategories || gearsByCode) {
      dispatch(getAllGearCodes())
    }
  }, [])

  useEffect(() => {
    if (categoriesToGears) {
      setFormattedAndFilteredCategoriesToGears(prepareCategoriesAndGearsToDisplay(categoriesToGears))
    }
  }, [categoriesToGears])

  const setGearRegulation = (property, value) => {
    dispatch(
      updateProcessingRegulationByKeyAndSubKey({
        key: REGULATORY_REFERENCE_KEYS.GEAR_REGULATION,
        subKey: property,
        value
      })
    )
  }

  const setRegulatedGears = (isAuthorized, regulatedGears) => {
    const property = isAuthorized ? GEAR_REGULATION_KEYS.AUTHORIZED : GEAR_REGULATION_KEYS.UNAUTHORIZED

    setGearRegulation(property, regulatedGears)
  }

  const setOtherInfo = value => {
    setGearRegulation(GEAR_REGULATION_KEYS.OTHER_INFO, value)
  }

  return (
    <Section show>
      <SectionTitle
        title={'Engins Réglementés'}
        isOpen={show}
        setIsOpen={setShow}
        dataCy={'regulatory-gears-section'}
      />
      <RegulatedGearsForms>
        <RegulatedGears
          show={show}
          authorized={true}
          regulatedGearsObject={gearRegulation[GEAR_REGULATION_KEYS.AUTHORIZED] || DEFAULT_AUTHORIZED_REGULATED_GEARS}
          setRegulatedGearsObject={setRegulatedGears}
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
        />
        <VerticalLine />
        <RegulatedGears
          show={show}
          authorized={false}
          regulatedGearsObject={
            gearRegulation[GEAR_REGULATION_KEYS.UNAUTHORIZED] || DEFAULT_UNAUTHORIZED_REGULATED_GEARS
          }
          setRegulatedGearsObject={setRegulatedGears}
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
        />
      </RegulatedGearsForms>
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          as="textarea"
          rows={2}
          placeholder=""
          value={gearRegulation?.otherInfo || ''}
          onChange={event => setOtherInfo(event.target.value)}
          width={'500px'}
          $isGray={gearRegulation?.otherInfo && gearRegulation?.otherInfo !== ''}
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedGearsForms = styled.div`
  display: flex;
`

export default GearRegulation
