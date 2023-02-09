import { GearInfractionsPicker } from './GearInfractionsPicker'
import { GearsPicker } from './GearsPicker'
import { FieldsetGroup } from '../../../FieldsetGroup'

export function GearsField() {
  return (
    <FieldsetGroup isLight legend="Engins à bord">
      <GearsPicker />
      <GearInfractionsPicker />
    </FieldsetGroup>
  )
}
