import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { SPECIES_REGULATION_KEYS } from '../../../../domain/entities/backoffice'
import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES,
  REGULATORY_REFERENCE_KEYS
} from '../../../../domain/entities/regulatory'
import { OtherRemark, Section, VerticalLine } from '../../../commonStyles/Backoffice.style'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import { updateProcessingRegulationByKeyAndSubKey } from '../../Regulation.slice'
import SectionTitle from '../../SectionTitle'
import RegulatedSpecies from './RegulatedSpecies'

function SpeciesRegulation() {
  const dispatch = useDispatch()

  /** @type {Map<string, Species>} speciesByCode */
  const speciesByCode = useSelector(state => state.species.speciesByCode)
  const speciesGroups = useSelector(state => state.species.speciesGroups)
  const [formattedSpecies, setFormattedSpecies] = useState([])
  const [formattedSpeciesGroups, setFormattedSpeciesGroups] = useState([])

  useEffect(() => {
    const formattedSpeciesGroups = [...speciesGroups]
      ?.sort((speciesA, speciesB) => speciesA.group?.localeCompare(speciesB.group))
      .map(speciesGroup => ({
        label: speciesGroup.group,
        value: speciesGroup.group
      }))

    setFormattedSpeciesGroups(formattedSpeciesGroups)
  }, [speciesGroups])

  useEffect(() => {
    const formattedSpecies = speciesByCode
      ? Object.values(speciesByCode)
          .sort((speciesA, speciesB) => speciesA.name?.localeCompare(speciesB.name))
          .map(_species => ({
            label: `${_species.name} (${_species.code})`,
            value: _species.code
          }))
      : []

    setFormattedSpecies(formattedSpecies)
  }, [speciesByCode])

  const { speciesRegulation } = useSelector(state => state.regulation.processingRegulation)
  const [show, setShow] = useState(false)

  const setSpeciesRegulation = (property, value) => {
    dispatch(
      updateProcessingRegulationByKeyAndSubKey({
        key: REGULATORY_REFERENCE_KEYS.SPECIES_REGULATION,
        subKey: property,
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
          regulatedSpecies={
            speciesRegulation[SPECIES_REGULATION_KEYS.AUTHORIZED] || DEFAULT_AUTHORIZED_REGULATED_SPECIES
          }
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
            speciesRegulation[SPECIES_REGULATION_KEYS.UNAUTHORIZED] || DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
          }
          setRegulatedSpecies={setRegulatedSpecies}
          show={show}
          speciesByCode={speciesByCode}
        />
      </RegulatedSpeciesForms>
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          $isGray={speciesRegulation?.otherInfo && speciesRegulation?.otherInfo !== ''}
          as="textarea"
          data-cy="regulatory-species-other-info"
          onChange={event => setOtherInfo(event.target.value)}
          placeholder=""
          rows={2}
          value={speciesRegulation?.otherInfo || ''}
          width="500px"
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedSpeciesForms = styled.div`
  display: flex;
`

export default SpeciesRegulation
