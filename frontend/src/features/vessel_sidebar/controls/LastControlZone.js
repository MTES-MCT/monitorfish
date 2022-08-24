import React from 'react'

import { controlType } from '../../../domain/entities/controls'
import { NoValue, Title, Zone } from '../common_styles/common.style'
import ControlField from './ControlField'

function LastControlZone(props) {
  const {
    /** @type {LastControls} lastControlList */
    controlsFromDate,
    lastControlList,
  } = props

  return lastControlList ? (
    <Zone>
      <Title>
        Derniers contrôles depuis{' '}
        {controlsFromDate ? (
          <>
            {controlsFromDate.getUTCFullYear() + 1} (sur{' '}
            {new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1} ans)
          </>
        ) : (
          <NoValue>-</NoValue>
        )}
      </Title>
      <ControlField field={lastControlList.SEA} isFirst type={controlType.SEA} />
      <ControlField
        data-cy="vessel-controls-last-land-control"
        field={lastControlList.LAND}
        isFirst={false}
        type={controlType.LAND}
      />
    </Zone>
  ) : null
}

export default LastControlZone
