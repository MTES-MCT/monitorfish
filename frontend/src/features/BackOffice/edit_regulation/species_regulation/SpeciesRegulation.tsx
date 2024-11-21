import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { RegulatedSpecies } from './RegulatedSpecies'
import { SPECIES_REGULATION_KEYS } from '../../../../domain/entities/backoffice'
import { OtherRemark, Section, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { regulationActions } from '../../../Regulation/slice'
import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES,
  REGULATORY_REFERENCE_KEYS
} from '../../../Regulation/utils'
import { SectionTitle } from '../../SectionTitle'

import type { Option } from '@mtes-mct/monitor-ui'

export function SpeciesRegulation() {
  const dispatch = useBackofficeAppDispatch()

  /** @type {Map<string, Species>} speciesByCode */
  const speciesByCode = useBackofficeAppSelector(state => state.species.speciesByCode)
  const speciesGroups = useBackofficeAppSelector(state => state.species.speciesGroups)
  const [formattedSpecies, setFormattedSpecies] = useState<Option[]>([])
  const [formattedSpeciesGroups, setFormattedSpeciesGroups] = useState<Option[]>([])

  useEffect(() => {
    const nextFormattedSpeciesGroups = [...speciesGroups]
      ?.sort((speciesA, speciesB) => speciesA.group?.localeCompare(speciesB.group))
      .map(speciesGroup => ({
        label: speciesGroup.group,
        value: speciesGroup.group
      }))

    setFormattedSpeciesGroups(nextFormattedSpeciesGroups)
  }, [speciesGroups])

  useEffect(() => {
    const nextFormattedSpecies = speciesByCode
      ? Object.values(speciesByCode)
          .sort((speciesA, speciesB) => speciesA.name?.localeCompare(speciesB.name))
          .map(_species => ({
            label: `${_species.name} (${_species.code})`,
            value: _species.code
          }))
      : []

    setFormattedSpecies(nextFormattedSpecies)
  }, [speciesByCode])

  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const [show, setShow] = useState(false)

  // TODO Impossible to type and make this code safe as it is, should be refactored?
  const setSpeciesRegulation = (subKey: any, value: any) => {
    dispatch(
      regulationActions.updateProcessingRegulationByKeyAndSubKey({
        key: REGULATORY_REFERENCE_KEYS.SPECIES_REGULATION as 'speciesRegulation',
        // @ts-ignore
        subKey,
        // @ts-ignore
        value
      })
    )
  }

  const setRegulatedSpecies = (isAuthorized, regulatedSpecies) => {
    const property = isAuthorized ? SPECIES_REGULATION_KEYS.AUTHORIZED : SPECIES_REGULATION_KEYS.UNAUTHORIZED

    setSpeciesRegulation(property, regulatedSpecies)
  }

  const setOtherInfo = value => {
    setSpeciesRegulation(SPECIES_REGULATION_KEYS.OTHER_INFO, value)
  }

  return (
    <Section show>
      <SectionTitle dataCy="open-regulated-species" isOpen={show} setIsOpen={setShow} title="ESPÈCES RÉGLEMENTÉES" />
      <RegulatedSpeciesForms>
        <RegulatedSpecies
          authorized
          formattedSpecies={formattedSpecies}
          formattedSpeciesGroups={formattedSpeciesGroups}
          regulatedSpecies={processingRegulation.speciesRegulation?.authorized ?? DEFAULT_AUTHORIZED_REGULATED_SPECIES}
          setRegulatedSpecies={setRegulatedSpecies}
          show={show}
          speciesByCode={speciesByCode}
        />
        <VerticalLine />
        <RegulatedSpecies
          authorized={false}
          formattedSpecies={formattedSpecies}
          formattedSpeciesGroups={formattedSpeciesGroups}
          regulatedSpecies={
            processingRegulation.speciesRegulation?.unauthorized ?? DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
          }
          setRegulatedSpecies={setRegulatedSpecies}
          show={show}
          speciesByCode={speciesByCode}
        />
      </RegulatedSpeciesForms>
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          $isGray={
            processingRegulation.speciesRegulation?.otherInfo &&
            processingRegulation.speciesRegulation?.otherInfo !== ''
          }
          as="textarea"
          data-cy="regulatory-species-other-info"
          onChange={event => setOtherInfo(event.target.value)}
          placeholder=""
          rows={2}
          value={processingRegulation.speciesRegulation?.otherInfo ?? ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedSpeciesForms = styled.div`
  display: flex;
`
