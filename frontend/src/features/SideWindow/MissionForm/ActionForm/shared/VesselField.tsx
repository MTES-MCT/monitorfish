import { useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'
import type { MissionActionFormValues } from '../../types'

export function VesselField() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { errors, setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  // TODO A vessel can't be unknown so this checkbox can't be implementedco: clarify this screen
  // const vesselSearchKey = useKey([values.isVesselUnknown])

  const defaultValue = useMemo(
    () => ({
      flagState: values.flagState,
      vesselName: values.vesselName
    }),
    [values.flagState, values.vesselName]
  )

  const handleVesselSearchChange = useCallback(
    (nextVessel: VesselIdentity | undefined) => {
      if (!nextVessel) {
        setFieldValue('externalReferenceNumber', undefined)
        setFieldValue('flagState', undefined)
        setFieldValue('internalReferenceNumber', undefined)
        setFieldValue('ircs', undefined)
        setFieldValue('vesselId', undefined, true)
        setFieldValue('vesselName', undefined)

        return
      }

      if (!nextVessel.vesselId || !nextVessel.vesselName) {
        return
      }

      setFieldValue('externalReferenceNumber', nextVessel.externalReferenceNumber)
      setFieldValue('flagState', nextVessel.flagState)
      setFieldValue('internalReferenceNumber', nextVessel.internalReferenceNumber)
      setFieldValue('ircs', nextVessel.ircs)
      setFieldValue('vesselId', nextVessel.vesselId)
      setFieldValue('vesselName', nextVessel.vesselName)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  /** A vessel can't be unknown so this checkbox can't be implemented
   * TODO Clarify this screen

   const handleIsVesselUnknownChange = useCallback(
   (isChecked: boolean) => {
      if (isChecked) {
        setFieldValue('isVesselUnknown', true)

        handleVesselSearchChange(undefined)

        return
      }

      setFieldValue('isVesselUnknown', false)
    },

   // eslint-disable-next-line react-hooks/exhaustive-deps
   [handleVesselSearchChange]
   )

   <Checkbox label="Navire inconnu" checked={!!values.isVesselUnknown} name="isVesselUnknown" onChange={handleIsVesselUnknownChange} />
   */

  return (
    <Wrapper>
      <StyledVesselSearch
        // key={vesselSearchKey}
        baseRef={newWindowContainerRef}
        defaultValue={defaultValue}
        disabled={values.isVesselUnknown}
        extendedWidth={400}
        hasError={!!errors.vesselId}
        hasVesselIdInResults
        isExtended
        onChange={handleVesselSearchChange}
      />
      {errors.vesselId && <Error>{errors.vesselId}</Error>}
    </Wrapper>
  )
}

const Error = styled.span`
  color: ${p => p.theme.color.maximumRed};
`

const Wrapper = styled.div`
  align-items: center;

  > div:first-child {
    flex-grow: 1;
    margin-right: 16px;
  }

  /* TODO Change that in monitor-ui */
  > div:last-child {
    label {
      white-space: nowrap;
    }
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  width: auto;
`
