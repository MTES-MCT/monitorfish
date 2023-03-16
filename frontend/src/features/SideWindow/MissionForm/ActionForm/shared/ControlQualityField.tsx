import { FormikCheckbox, FormikMultiRadio, FormikTextarea } from '@mtes-mct/monitor-ui'

import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

export function ControlQualityField() {
  return (
    <FieldsetGroup isLight legend="Qualité du contrôle">
      <FormikMultiRadio isInline label="Navire ciblé par le CNSP" name="vesselTargeted" options={BOOLEAN_AS_OPTIONS} />
      <FormikCheckbox label="Unité sans jauge oméga" name="unitWithoutOmegaGauge" />
      <FormikTextarea
        label="Observations sur le déroulé du contrôle"
        name="controlQualityComments"
        placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
      />
      <FormikCheckbox label="Fiche RETEX nécessaire" name="feedbackSheetRequired" />
    </FieldsetGroup>
  )
}
