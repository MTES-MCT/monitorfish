import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Textarea, type Option } from '@mtes-mct/monitor-ui'
import { SPECIES_REGULATION_KEYS } from 'domain/entities/backoffice'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { RegulatedSpecies } from './RegulatedSpecies'
import { OtherRemark, Section, VerticalLine } from '../../../../commonStyles/Backoffice.style'
import { regulationActions } from '../../../slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../utils'
import { SectionTitle } from '../../RegulationTables/SectionTitle'

import type { RegulatedSpecies as RegulatedSpeciesType } from '@features/Regulation/types'

export function SpeciesRegulation() {
  const dispatch = useBackofficeAppDispatch()
  const speciesByCode = useBackofficeAppSelector(state => state.species.speciesByCode)
  const speciesGroups = useBackofficeAppSelector(state => state.species.speciesGroups)

  const [formattedSpecies, setFormattedSpecies] = useState<Option[]>([])
  const [formattedSpeciesGroups, setFormattedSpeciesGroups] = useState<Option[]>([])

  useEffect(() => {
    const nextFormattedSpeciesGroups = [...speciesGroups]
      ?.sort((speciesA, speciesB) => speciesA.group.localeCompare(speciesB.group))
      .map(speciesGroup => ({
        label: speciesGroup.group,
        value: speciesGroup.group
      }))

    setFormattedSpeciesGroups(nextFormattedSpeciesGroups)
  }, [speciesGroups])

  useEffect(() => {
    const nextFormattedSpecies = speciesByCode
      ? Object.values(speciesByCode)
          .sort((speciesA, speciesB) => speciesA.name.localeCompare(speciesB.name))
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
  const setSpeciesRegulation = useCallback(
    (subKey: string, value: any) => {
      dispatch(
        regulationActions.updateProcessingRegulationByKeyAndSubKey({
          key: REGULATORY_REFERENCE_KEYS.SPECIES_REGULATION,
          subKey,
          value
        })
      )
    },
    [dispatch]
  )

  const setRegulatedSpecies = useCallback(
    (isAuthorized: boolean, regulatedSpecies: RegulatedSpeciesType) => {
      const property = isAuthorized ? SPECIES_REGULATION_KEYS.AUTHORIZED : SPECIES_REGULATION_KEYS.UNAUTHORIZED

      setSpeciesRegulation(property, regulatedSpecies)
    },
    [setSpeciesRegulation]
  )

  const setOtherInfo = (value: string | undefined) => {
    setSpeciesRegulation(SPECIES_REGULATION_KEYS.OTHER_INFO, value)
  }

  return (
    <Section $show>
      <SectionTitle dataCy="open-regulated-species" isOpen={show} setIsOpen={setShow} title="ESPÈCES RÉGLEMENTÉES" />
      <RegulatedSpeciesForms>
        <RegulatedSpecies
          authorized
          formattedSpecies={formattedSpecies}
          formattedSpeciesGroups={formattedSpeciesGroups}
          regulatedSpecies={processingRegulation.speciesRegulation.authorized}
          setRegulatedSpecies={setRegulatedSpecies}
          show={show}
          speciesByCode={speciesByCode}
        />
        <VerticalLine />
        <RegulatedSpecies
          authorized={false}
          formattedSpecies={formattedSpecies}
          formattedSpeciesGroups={formattedSpeciesGroups}
          regulatedSpecies={processingRegulation.speciesRegulation.unauthorized}
          setRegulatedSpecies={setRegulatedSpecies}
          show={show}
          speciesByCode={speciesByCode}
        />
      </RegulatedSpeciesForms>
      <OtherRemark $show={show}>
        <Textarea
          data-cy="regulatory-species-other-info"
          label="Remarques"
          name="speciesRegulationOtherInfo"
          onChange={setOtherInfo}
          rows={2}
          style={{ width: '500px' }}
          value={processingRegulation.speciesRegulation?.otherInfo ?? ''}
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedSpeciesForms = styled.div`
  display: flex;
`
