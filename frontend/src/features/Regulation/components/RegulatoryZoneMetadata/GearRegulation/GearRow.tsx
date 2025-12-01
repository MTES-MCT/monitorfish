import { GearOrGearCategoryFields } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/GearOrGearCategoryFields'
import { Label } from '@features/Regulation/components/RegulatoryZoneMetadata/RegulatoryMetadata.style'
import { type Gear } from '@features/Regulation/types'

type GearRowProps = {
  gear: Gear
}
export function GearRow({ gear }: GearRowProps) {
  return (
    <div key={gear.code}>
      <Label>
        {gear.code} ({gear.name})
      </Label>
      <GearOrGearCategoryFields gearOrCategory={gear} />
    </div>
  )
}
