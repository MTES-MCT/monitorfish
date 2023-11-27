import styled from 'styled-components'

import { Section } from './shared/Section'
import { TextareaForm } from './shared/TextareaForm'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

type AreaNoteProps = {
  controlUnit: ControlUnit.ControlUnit
  onSubmit: (nextControlUnit: ControlUnit.ControlUnit) => any
}
export function AreaNote({ controlUnit, onSubmit }: AreaNoteProps) {
  return (
    <Section>
      <Section.Title>Secteur d’intervention</Section.Title>
      <StyledSectionBody>
        <TextareaForm
          controlUnit={controlUnit}
          isLabelHidden
          label="Secteur d’intervention"
          name="areaNote"
          onSubmit={onSubmit}
        />
      </StyledSectionBody>
    </Section>
  )
}

const StyledSectionBody = styled(Section.Body)`
  padding: 24px 32px;

  > div:not(:first-child) {
    margin-top: 8px;
  }
`
