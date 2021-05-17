import React from 'react'
import { NoValue, Title, Zone } from './Controls.style'
import { controlType } from '../../domain/entities/controls'
import ControlField from './ControlField'

const LastControlZone = props => {
  const {
    lastControlList,
    controlsFromDate
  } = props

  return lastControlList
    ? <Zone>
      <Title>
          Derniers contrôles depuis{' '}
        {
          controlsFromDate
            ? <>
              {controlsFromDate.getUTCFullYear() + 1}
              {' '}(sur { new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1 } ans)
            </>
            : <NoValue>-</NoValue>
        }
      </Title>
      <ControlField field={lastControlList.SEA} type={controlType.SEA} isFirst={true} />
      <ControlField field={lastControlList.LAND} type={controlType.LAND} isFirst={false} />
      </Zone>
    : null
}

export default LastControlZone
