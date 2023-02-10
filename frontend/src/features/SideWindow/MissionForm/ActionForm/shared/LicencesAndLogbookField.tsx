import { FormikMultiRadio } from '@mtes-mct/monitor-ui'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { MissionAction } from '../../../../../domain/types/missionAction'

export function LicencesAndLogbookField() {
  return (
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction obligations déclaratives / autorisations"
      generalObservationTextareaProps={{
        label: 'Observations (hors infractions) sur les obligations déclaratives / autorisations',
        name: 'licencesAndLogbookObservations'
      }}
      label="Obligations déclaratives et autorisations de pêche"
      name="logbookInfractions"
    >
      <FormikMultiRadio
        isInline
        label="Bonne émission VMS"
        name="emitsVms"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Bonne émission AIS"
        name="emitsAis"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Déclarations journal de pêche conformes à l'activité du navire"
        name="logbookMatchesActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Autorisations de pêche conformes à l'activité du navire (zone, engins, espèces)"
        name="licencesMatchActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
    </FormikMultiInfractionPicker>
  )
}
