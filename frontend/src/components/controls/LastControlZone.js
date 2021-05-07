import React from 'react'
import { Title, Zone } from './Controls.style'
import { controlType } from '../../domain/entities/controls'
import ControlField from './ControlField'

const LastControlZone = props => {
  const { lastControlList } = props
  return lastControlList && lastControlList.SEA && lastControlList.LAND
    ? <Zone>
      <Title>
          Derniers Contrôles
      </Title>
      <ControlField field={lastControlList.SEA} type={controlType.SEA} />
      <ControlField field={lastControlList.LAND} type={controlType.LAND} />
      </Zone>
    : null
}

export default LastControlZone
