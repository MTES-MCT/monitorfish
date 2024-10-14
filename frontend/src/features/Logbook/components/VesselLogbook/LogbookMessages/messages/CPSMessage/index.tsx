import { useMemo } from 'react'

import { ProtectedCatchDetails } from './ProtectedCatchDetails'
import { buildProtectedCatchArray } from '../../../../../utils'
import { WeightType } from '../../constants'
import { SpeciesList } from '../../styles'
import { CatchMessageZone } from '../common/CatchMessageZone'
import { SpecyCatch } from '../common/SpecyCatch'

import type { Logbook } from '@features/Logbook/Logbook.types'

type CPSMessageProps = Readonly<{
  message: Logbook.CpsMessageValue
}>
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
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            isProtectedSpecy
            specyCatch={speciesCatch}
            weightType={WeightType.LIVE}
          >
            {speciesCatch.properties.map((specyCatch, specyIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProtectedCatchDetails key={specyIndex} specyCatch={specyCatch} />
            ))}
          </SpecyCatch>
        ))}
      </SpeciesList>
    </>
  )
}
