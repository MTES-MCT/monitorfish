/* eslint-disable sort-keys-fix/sort-keys-fix */

import { ReportingOriginActor, ReportingType } from '@features/Reporting/types'
import { number, object, string } from 'yup'
import {HIDDEN_ERROR} from "@features/Mission/components/MissionForm/constants";
import {customDayjs} from "@mtes-mct/monitor-ui";

export const CreateOrEditReportingSchema = object({
  reportingActor: string().required('Veuillez renseigner l&apos;origine du signalement.'),
  authorTrigram: string().required('Veuillez renseigner le trigramme de saisie.'),
  title: string().required('Veuillez renseigner le titre du signalement.'),
  type: string().oneOf(Object.values(ReportingType)).required('Veuillez renseigner le type de signalement.'),
  natinfCode: number().when('type', {
    is: (type?: string) => type === ReportingType.INFRACTION_SUSPICION,
    then: schema => schema.required('Veuillez renseigner le NATINF.')
  }),
  controlUnitId: string().test({
    message: 'Veuillez renseigner l&apos;unité',
    test: (controlUnitId, context) =>
      context.parent.reportingActor === ReportingOriginActor.UNIT ? !!controlUnitId : true
  }),
  expirationDate: string()
    .test({
      message: 'La date de fin de validité doit être dans le futur.',
      test: (expirationDate) =>
        expirationDate ? customDayjs().isBefore(expirationDate) : true
    }),
  authorContact: string().test({
    message: 'Veuillez renseigner le contact',
    test: (authorContact, context) => {
      const { reportingActor } = context.parent
      if (
        reportingActor === ReportingOriginActor.DML ||
        reportingActor === ReportingOriginActor.DIRM ||
        reportingActor === ReportingOriginActor.OTHER
      ) {
        return !!authorContact
      }

      return true
    }
  })
})
