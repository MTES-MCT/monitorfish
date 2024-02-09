import { useMemo } from 'react'

import { ProtectedCatchDetails } from './ProtectedCatchDetails'
import { buildProtectedCatchArray } from '../../../../../utils'
import { WeightType } from '../../constants'
import { SpeciesList } from '../../styles'
import { CatchMessageZone } from '../common/CatchMessageZone'
import { SpecyCatch } from '../common/SpecyCatch'

import type { CPSMessageValue } from '../../../../../Logbook.types'

type CPSMessageProps = {
  message: CPSMessageValue
}
export function CPSMessage({ message }: CPSMessageProps) {
  const catchesWithProperties = useMemo(() => {
    if (!message?.catches) {
      return []
    }

    return buildProtectedCatchArray(message.catches)
  }, [message])

  return (
    <>
      <CatchMessageZone
        datetimeUtc={message.cpsDatetimeUtc}
        dimensions={message.dimensions}
        gear={message.gear}
        gearName={message.gearName}
        latitude={message.latitude}
        longitude={message.longitude}
        mesh={message.mesh}
      />
      <SpeciesList $hasCatches={!!message.catches.length}>
        {catchesWithProperties.map((speciesCatch, index) => (
          <SpecyCatch
            key={`CPS${speciesCatch.species}`}
            isLast={catchesWithProperties.length === index + 1}
            isProtectedSpecies
            specyCatch={speciesCatch}
            weightType={WeightType.LIVE}
          >
            {speciesCatch.properties.map(specyCatch => (
              <ProtectedCatchDetails specyCatch={specyCatch} />
            ))}
          </SpecyCatch>
        ))}
      </SpeciesList>
    </>
  )
}
