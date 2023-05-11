import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SectionTitle from '../../SectionTitle'
import { CustomInput, Label } from '../../../commonStyles/Input.style'
import RegulatedSpecies from './RegulatedSpecies'
import { updateProcessingRegulationByKeyAndSubKey } from '../../slice'
import { OtherRemark, Section, VerticalLine } from '../../../commonStyles/Backoffice.style'
import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES,
  REGULATORY_REFERENCE_KEYS
} from '../../../../domain/entities/regulation'
import { SPECIES_REGULATION_KEYS } from '../../../../domain/entities/backoffice'
import styled from 'styled-components'

const SpeciesRegulation = () => {
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
      <SectionTitle
        dataCy={'open-regulated-species'}
        title={'ESPÈCES RÉGLEMENTÉES'}
        isOpen={show}
        setIsOpen={setShow}
      />
      <RegulatedSpeciesForms>
        <RegulatedSpecies
          show={show}
          authorized={true}
          regulatedSpecies={
            speciesRegulation[SPECIES_REGULATION_KEYS.AUTHORIZED] || DEFAULT_AUTHORIZED_REGULATED_SPECIES
          }
          setRegulatedSpecies={setRegulatedSpecies}
          speciesByCode={speciesByCode}
          formattedSpeciesGroups={formattedSpeciesGroups}
          formattedSpecies={formattedSpecies}
        />
        <VerticalLine />
        <RegulatedSpecies
          show={show}
          authorized={false}
          regulatedSpecies={
            speciesRegulation[SPECIES_REGULATION_KEYS.UNAUTHORIZED] || DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
          }
          setRegulatedSpecies={setRegulatedSpecies}
          speciesByCode={speciesByCode}
          formattedSpeciesGroups={formattedSpeciesGroups}
          formattedSpecies={formattedSpecies}
        />
      </RegulatedSpeciesForms>
      <OtherRemark show={show}>
        <Label>Remarques</Label>
        <CustomInput
          data-cy={'regulatory-species-other-info'}
          as="textarea"
          rows={2}
          placeholder=""
          value={speciesRegulation?.otherInfo || ''}
          onChange={event => setOtherInfo(event.target.value)}
          width={'500px'}
          $isGray={speciesRegulation?.otherInfo && speciesRegulation?.otherInfo !== ''}
        />
      </OtherRemark>
    </Section>
  )
}

const RegulatedSpeciesForms = styled.div`
  display: flex;
`

export default SpeciesRegulation
