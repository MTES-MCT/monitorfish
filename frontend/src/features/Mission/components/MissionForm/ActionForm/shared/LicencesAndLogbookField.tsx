import { MissionAction } from '@features/Mission/missionAction.types'
import { FormikMultiRadio, FormikTextarea } from '@mtes-mct/monitor-ui'

import { FieldsetGroup } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

export function LicencesAndLogbookField() {
  return (
    <FieldsetGroup isLight legend="Obligations déclaratives et autorisations de pêche">
      <FormikMultiRadio
        isErrorMessageHidden
        isInline
        isRequired
        label="Bonne émission VMS"
        name="emitsVms"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isErrorMessageHidden
        isInline
        isRequired
        label="Bonne émission AIS"
        name="emitsAis"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isErrorMessageHidden
        isInline
        isRequired
        label="Déclarations journal de pêche conformes à l’activité du navire"
        name="logbookMatchesActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isErrorMessageHidden
        isInline
        isRequired
        label="Autorisations de pêche conformes à l’activité du navire (zone, engins, espèces)"
        name="licencesMatchActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />

      <FieldsetGroupSeparator marginBottom={12} />
      <FormikTextarea
        label="Observations (hors infractions) sur les obligations déclaratives / autorisations"
        name="licencesAndLogbookObservations"
        rows={2}
      />
    </FieldsetGroup>
  )
}
