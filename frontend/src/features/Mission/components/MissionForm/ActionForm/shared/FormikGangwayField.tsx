import { MissionAction } from '@features/Mission/missionAction.types'
import { Accent, Button, Icon, Label, Size, THEME } from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import type { MissionActionFormValues } from '../../types'

import ControlCheck = MissionAction.ControlCheck

const GANGWAY_DEPENDENT_FIELDS: Array<keyof MissionActionFormValues> = [
  'propulsionEnginePowerControl',
  'fishingLicencesMatchActivity',
  'stowagePlanPresent',
  'onboardWeighingPermit',
  'weighingCertificateAndSystemsValid',
  'emitsVms',
  'emitsAis',
  'licencesMatchActivity',
  'logbookMatchesActivity',
  'separateStowageOfPreservedSpecies',
  'speciesWeightControlled',
  'speciesSizeControlled',
  'underSizedSeparateStowage',
  'underSizedSeparateRecording'
]

const activeStyle = {
  backgroundColor: THEME.color.blueGray,
  borderColor: THEME.color.blueGray,
  color: 'white'
}

const inactiveStyle = {
  backgroundColor: THEME.color.blueGray25,
  borderColor: THEME.color.blueGray,
  color: THEME.color.charcoal
}

export function FormikGangwayField() {
  const [input, , helpers] = useField<MissionActionFormValues['isGangwayDeployed']>('isGangwayDeployed')
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const prevGangway = useRef(values.isGangwayDeployed)

  useEffect(() => {
    if (values.isGangwayDeployed === prevGangway.current) {
      return
    }
    prevGangway.current = values.isGangwayDeployed

    if (values.isGangwayDeployed === false) {
      GANGWAY_DEPENDENT_FIELDS.forEach(field => setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE))

      values.gearOnboard?.forEach((_, index) => {
        setFieldValue(`gearOnboard[${index}].gearWasControlled`, false)
        setFieldValue(`gearOnboard[${index}].gearMarkingIsCompliant`, ControlCheck.NOT_APPLICABLE)
      })
    } else if (values.isGangwayDeployed === true) {
      GANGWAY_DEPENDENT_FIELDS.forEach(field => setFieldValue(field, undefined))

      values.gearOnboard?.forEach((_, index) => {
        setFieldValue(`gearOnboard[${index}].gearWasControlled`, undefined)
        setFieldValue(`gearOnboard[${index}].gearMarkingIsCompliant`, undefined)
      })
    }
  }, [values.gearOnboard, values.isGangwayDeployed, setFieldValue])

  return (
    <Wrapper>
      <Text>
        <Label $isRequired>Echelle de coupée</Label>
        L&apos;échelle a-t-elle été mise à disposition et est-elle praticable ?
      </Text>
      <Buttons>
        <Button
          accent={Accent.PRIMARY}
          data-testid="yes-no-toogle-yes-button"
          Icon={Icon.Confirm}
          onClick={() => helpers.setValue(true)}
          size={Size.NORMAL}
          style={input.value === true ? activeStyle : inactiveStyle}
        >
          Oui
        </Button>
        <Button
          accent={Accent.PRIMARY}
          data-testid="yes-no-toogle-no-button"
          Icon={Icon.Reject}
          onClick={() => helpers.setValue(false)}
          size={Size.NORMAL}
          style={{ borderLeft: 'none', ...(input.value === false ? activeStyle : inactiveStyle) }}
        >
          Non
        </Button>
      </Buttons>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${p => p.theme.color.blueGray25};
  border: 1px solid ${p => p.theme.color.lightGray};
`

const Buttons = styled.div`
  margin-left: auto;
`

const Text = styled.div`
  > label {
    font-weight: 700;
    color: ${p => p.theme.color.blueGray};
    margin-bottom: 4px;
  }

  font-weight: 500;
`
