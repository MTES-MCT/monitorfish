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

// This check is hidden on both control types (regulation not mature yet) and forced to N/A.
const NOT_APPLICABLE_FIELDS: Array<keyof MissionActionFormValues> = ['propulsionEnginePowerControl']

export function LicencesAndLogbookField() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL

  useEffect(() => {
    NOT_APPLICABLE_FIELDS.forEach(field => {
      if (values[field] !== MissionAction.ControlCheck.NOT_APPLICABLE) {
        setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      }
    })
    // Only trigger from values of NOT_APPLICABLE_FIELDS const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, values.propulsionEnginePowerControl])

  const landControlFields = [
    { isRequired: true, label: 'Bonne émission VMS', name: 'emitsVms' },
    { isRequired: true, label: 'Bonne émission AIS', name: 'emitsAis' },
    ...(isEISREnabled
      ? [
          {
            isRequired: true,
            label: 'Accès au port / autorisation de débarquement conformes',
            name: 'portEntranceAndLandingAuthorized'
          }
        ]
      : [])
  ]

  const rows: ControlCheckRow[] = [
    ...(isLandControl
      ? landControlFields
      : [
          ...(isEISREnabled
            ? [
                {
                  isRequired: true,
                  label: 'Echelle de coupée présente et conforme',
                  name: 'gangwayPresentAndCompliant'
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
            label: 'Journal de pêche ouvert avant le contrôle',
            name: 'logbookOpenedPriorToControl'
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
      label: 'Autorisations de pêche (AEP, ANP, licences locales) conformes à l’activité du navire',
      name: 'licencesMatchActivity'
    },
    ...(isEISREnabled
      ? [
          {
            isRequired: true,
            label: 'Licence de pêche européenne valide',
            name: 'europeanFishingLicenceValid'
          },
          {
            hasBorderBottom: true,
            isRequired: true,
            label: 'Plan d’arrimage présent et conforme',
            name: 'stowagePlanPresent'
          },
          {
            // N/A is not a valid answer for this check: it can only be granted or not.
            isNotApplicableDisabled: true,
            isRequired: true,
            label: 'Autorisation pour la pesée à bord',
            name: 'onboardWeighingPermit'
          },
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
    <FieldsetGroup isLight legend="Conformité du navire">
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
