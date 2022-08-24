import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { GEAR_REGULATION_KEYS, prepareCategoriesAndGearsToDisplay } from '../../../../domain/entities/backoffice'
import {
  DEFAULT_AUTHORIZED_REGULATED_GEARS,
  DEFAULT_UNAUTHORIZED_REGULATED_GEARS,
  REGULATORY_REFERENCE_KEYS,
} from '../../../../domain/entities/regulatory'
import getAllGearCodes from '../../../../domain/use_cases/gearCode/getAllGearCodes'
import { Section, OtherRemark, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { updateProcessingRegulationByKeyAndSubKey } from '../../Regulation.slice'
import SectionTitle from '../../SectionTitle'
import RegulatedGears from './RegulatedGears'

function GearRegulation() {
  const dispatch = useDispatch()
  const { gearRegulation } = useSelector(state => state.regulation.processingRegulation)

  const {
    /** @type {Object.<string, Gear[]>} */
    categoriesToGears,
    gearsByCode,
    groupsToCategories,
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
        value,
      }),
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
      <SectionTitle dataCy="regulatory-gears-section" isOpen={show} setIsOpen={setShow} title="Engins Réglementés" />
      <RegulatedGearsForms>
        <RegulatedGears
          authorized
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
          regulatedGearsObject={gearRegulation[GEAR_REGULATION_KEYS.AUTHORIZED] || DEFAULT_AUTHORIZED_REGULATED_GEARS}
          setRegulatedGearsObject={setRegulatedGears}
          show={show}
        />
        <VerticalLine />
        <RegulatedGears
          authorized={false}
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
          regulatedGearsObject={
            gearRegulation[GEAR_REGULATION_KEYS.UNAUTHORIZED] || DEFAULT_UNAUTHORIZED_REGULATED_GEARS
          }
          setRegulatedGearsObject={setRegulatedGears}
          show={show}
        />
      </RegulatedGearsForms>
      <OtherRemark show={show}>
        <Label>Remarques générales</Label>
        <CustomInput
          $isGray={gearRegulation?.otherInfo && gearRegulation?.otherInfo !== ''}
          as="textarea"
          onChange={event => setOtherInfo(event.target.value)}
          placeholder=""
          rows={2}
          value={gearRegulation?.otherInfo || ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedGearsForms = styled.div`
  display: flex;
`

export default GearRegulation
