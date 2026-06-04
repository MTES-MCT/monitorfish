import { MissionAction } from '@features/Mission/missionAction.types'
import { FormikTextarea } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import { ControlCheckTable } from './ControlCheckTable'
import { useIsEISREnabled } from '../../hooks/useIsEISREnabled'
import { FieldsetGroup } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { ControlCheckRow } from './ControlCheckTable'
import type { MissionActionFormValues } from '../../types'

// On land controls these checks are not relevant: they are hidden and forced to N/A.
const LAND_CONTROL_NOT_APPLICABLE_FIELDS: Array<keyof MissionActionFormValues> = [
  'propulsionEnginePowerControl',
  'emitsVms',
  'emitsAis'
]

export function LicencesAndLogbookField() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL

  useEffect(() => {
    if (!isLandControl) {
      return
    }

    LAND_CONTROL_NOT_APPLICABLE_FIELDS.forEach(field => {
      if (values[field] !== MissionAction.ControlCheck.NOT_APPLICABLE) {
        setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      }
    })
    // Only trigger from values of LAND_CONTROL_NOT_APPLICABLE_FIELDS const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLandControl, setFieldValue, values.propulsionEnginePowerControl, values.emitsVms, values.emitsAis])

  const landControlFields = isEISREnabled
    ? [
        {
          isRequired: true,
          label: 'Contrôle de l’émission VMS avant l’arrivée à terre',
          name: 'vmsEmissionControlBeforeArrival'
        },
        {
          isRequired: true,
          label: 'Accès au port / autorisation de débarquement conformes',
          name: 'portEntranceAndLandingAuthorized'
        }
      ]
    : []

  const rows: ControlCheckRow[] = [
    ...(isLandControl
      ? landControlFields
      : [
          ...(isEISREnabled
            ? [
                {
                  isRequired: true,
                  label: 'Contrôle de la puissance du moteur de propulsion',
                  name: 'propulsionEnginePowerControl'
                }
              ]
            : []),
          { isRequired: true, label: 'Bonne émission VMS', name: 'emitsVms' },
          { isRequired: true, label: 'Bonne émission AIS', name: 'emitsAis' }
        ]),
    ...(isEISREnabled
      ? [
          {
            isRequired: true,
            label: 'Journal de pêche complété avant le contrôle',
            name: 'logbookFilledPriorToControl'
          }
        ]
      : []),
    {
      isRequired: true,
      label: 'Déclarations journal de pêche conformes à l’activité du navire',
      name: 'logbookMatchesActivity'
    },
    {
      isRequired: true,
      label: 'Autorisations de pêche (AEP) conformes à l’activité du navire',
      name: 'licencesMatchActivity'
    },
    ...(isEISREnabled
      ? [
          {
            isRequired: true,
            label: 'Licence de pêche conformes à l’activité du navire',
            name: 'fishingLicencesMatchActivity'
          },
          {
            hasBorderBottom: true,
            isRequired: true,
            label: 'Plan d’arrimage présent et valide',
            name: 'stowagePlanPresent'
          },
          { isRequired: true, label: 'Autorisation pour la pesée à bord', name: 'onboardWeighingPermit' },
          ...(values.onboardWeighingPermit === MissionAction.ControlCheck.YES
            ? [
                {
                  isRequired: true,
                  label: 'Certificat de pesée présent et systèmes de pesée à bord valides',
                  name: 'weighingCertificateAndSystemsValid'
                }
              ]
            : [])
        ]
      : [])
  ]

  return (
    <FieldsetGroup isLight legend="Obligations déclaratives et autorisations">
      <ControlCheckTable rows={rows} />
      <FieldsetGroupSeparator marginBottom={12} />
      <FormikTextarea
        label="Observations (hors infractions) sur les obligations déclaratives / autorisations"
        name="licencesAndLogbookObservations"
        rows={2}
      />
    </FieldsetGroup>
  )
}
