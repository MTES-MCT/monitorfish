import { FormikCheckbox, FormikMultiRadio, FormikTextarea } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { MissionAction } from '../../../../../domain/types/missionAction'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

export function ControlQualityField() {
  return (
    <Wrapper isLight legend="Qualité du contrôle">
      <FormikMultiRadio
        isInline
        label="Navire ciblé par le CNSP"
        name="vesselTargeted"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikCheckbox label="Unité sans jauge oméga" name="unitWithoutOmegaGauge" />
      <FormikTextarea
        label="Observations sur le déroulé du contrôle"
        name="controlQualityComments"
        placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
        rows={2}
      />
      <FormikCheckbox label="Fiche RETEX nécessaire" name="feedbackSheetRequired" />
    </Wrapper>
  )
}

const Wrapper = styled(FieldsetGroup)`
  > div {
    > .Element-Fieldset:not(:first-child),
    > .Element-Field {
      margin-top: 16px;
    }
  }
`
