import { FulfillingBouncingCircleSpinner } from '@components/FulfillingBouncingCircleSpinner'
import { customSentry, type CustomSentryMeasurementName } from '@libs/customSentry'
import { THEME } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import VesselSVG from '../features/icons/Icone_navire.svg?react'

export type LoadingSpinnerWallProps = {
  customSentryProps?:
    | {
        id: string
        maxExpectedDurationInMs?: number
        name: CustomSentryMeasurementName
      }
    | undefined
  isVesselShowed?: boolean
  message?: string
}
export function LoadingSpinnerWall({
  customSentryProps,
  isVesselShowed = false,
  message = 'Chargement...'
}: LoadingSpinnerWallProps) {
  useEffect(
    () => () => {
      if (!customSentryProps) {
        return
      }

      customSentry.endMeasurement(
        customSentryProps.name,
        customSentryProps.id,
        customSentryProps.maxExpectedDurationInMs
      )
    },
    [customSentryProps]
  )

  return (
    <Wrapper data-cy="first-loader">
      <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.lightGray} size={48} />
      {isVesselShowed && <BigVessel />}
      <p style={{ marginTop: isVesselShowed ? '-12px' : '16px' }}>{message}</p>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`

const BigVessel = styled(VesselSVG)`
  position: relative;
  top: -37px;
  width: 25px;
`
