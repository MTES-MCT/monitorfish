import React from 'react'
import { controlType } from '../../../domain/entities/controls'
import ControlField from './ControlField'
import { NoValue, Title, Zone } from '../common_styles/common.style'

const LastControlZone = props => {
  const {
    /** @type {LastControls} lastControlList */
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
              {' '}(sur {new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1} ans)
            </>
            : <NoValue>-</NoValue>
        }
      </Title>
      <ControlField field={lastControlList.SEA} type={controlType.SEA} isFirst={true}/>
      <ControlField data-cy={'vessel-controls-last-land-control'} field={lastControlList.LAND} type={controlType.LAND} isFirst={false}/>
    </Zone>
    : null
}

export default LastControlZone
