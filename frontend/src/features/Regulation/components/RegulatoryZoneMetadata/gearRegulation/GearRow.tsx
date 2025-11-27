import { CodeAndName } from '@features/Regulation/components/RegulatoryZoneMetadata/CodeAndName'
import { GearOrGearCategoryFields } from '@features/Regulation/components/RegulatoryZoneMetadata/gearRegulation/GearOrGearCategoryFields'

import type { Gear as GearReferentialType } from '../../../../../domain/types/Gear'
import type { Gear } from '@features/Regulation/types'

type GearRowProps = {
  categoriesToGears?: Record<string, GearReferentialType[]> | undefined
  gear: Gear
}
export function GearRow({ categoriesToGears, gear }: GearRowProps) {
  return (
    <div key={gear.code}>
      <CodeAndName categoriesToGears={categoriesToGears} code={gear.code} isCategory={false} name={gear.name} />
      <GearOrGearCategoryFields gearOrCategory={gear} />
    </div>
  )
}
