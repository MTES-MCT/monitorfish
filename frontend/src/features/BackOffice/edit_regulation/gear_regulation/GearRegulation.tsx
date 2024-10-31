import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { RegulatedGears } from './RegulatedGears'
import { GEAR_REGULATION_KEYS, prepareCategoriesAndGearsToDisplay } from '../../../../domain/entities/backoffice'
import getAllGearCodes from '../../../../domain/use_cases/gearCode/getAllGearCodes'
import { Section, OtherRemark, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import {
  DEFAULT_AUTHORIZED_REGULATED_GEARS,
  DEFAULT_UNAUTHORIZED_REGULATED_GEARS,
  REGULATORY_REFERENCE_KEYS
} from '../../../Regulation/utils'
import { SectionTitle } from '../../SectionTitle'
import { updateProcessingRegulationByKeyAndSubKey } from '../../slice'

export function GearRegulation() {
  const dispatch = useBackofficeAppDispatch()
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const categoriesToGears = useBackofficeAppSelector(state => state.gear.categoriesToGears)
  const gearsByCode = useBackofficeAppSelector(state => state.gear.gearsByCode)
  const groupsToCategories = useBackofficeAppSelector(state => state.gear.groupsToCategories)

  const [show, setShow] = useState(false)
  /** @type {string[]} */
  const [formattedAndFilteredCategoriesToGears, setFormattedAndFilteredCategoriesToGears] = useState<any[]>([])

  useEffect(() => {
    if (!categoriesToGears || !groupsToCategories || gearsByCode) {
      dispatch(getAllGearCodes())
    }
  }, [categoriesToGears, dispatch, gearsByCode, groupsToCategories])

  useEffect(() => {
    if (categoriesToGears) {
      setFormattedAndFilteredCategoriesToGears(prepareCategoriesAndGearsToDisplay(categoriesToGears))
    }
  }, [categoriesToGears])

  // TODO Impossible to type and make this code safe as it is, should be refactored?
  const setGearRegulation = (subKey: any, value: any) => {
    dispatch(
      updateProcessingRegulationByKeyAndSubKey({
        key: REGULATORY_REFERENCE_KEYS.GEAR_REGULATION as 'gearRegulation',
        // @ts-ignore
        subKey,
        // @ts-ignore
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
      <SectionTitle dataCy="regulatory-gears-section" isOpen={show} setIsOpen={setShow} title="Engins Réglementés" />
      <RegulatedGearsForms>
        <RegulatedGears
          authorized
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
          regulatedGearsObject={processingRegulation.gearRegulation?.authorized ?? DEFAULT_AUTHORIZED_REGULATED_GEARS}
          setRegulatedGearsObject={setRegulatedGears}
          show={show}
        />
        <VerticalLine />
        <RegulatedGears
          authorized={false}
          formattedAndFilteredCategoriesToGears={formattedAndFilteredCategoriesToGears}
          regulatedGearsObject={
            processingRegulation.gearRegulation?.unauthorized ?? DEFAULT_UNAUTHORIZED_REGULATED_GEARS
          }
          setRegulatedGearsObject={setRegulatedGears}
          show={show}
        />
      </RegulatedGearsForms>
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          $isGray={!!processingRegulation.gearRegulation?.otherInfo}
          as="textarea"
          onChange={event => setOtherInfo(event.target.value)}
          placeholder=""
          rows={2}
          value={processingRegulation.gearRegulation?.otherInfo ?? ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedGearsForms = styled.div`
  display: flex;
`
