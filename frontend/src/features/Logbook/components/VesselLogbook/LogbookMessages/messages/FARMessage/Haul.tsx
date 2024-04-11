import { useMemo } from 'react'
import styled from 'styled-components'

import { CatchDetails } from './CatchDetails'
import { buildCatchArray } from '../../../../../utils'
import { WeightType } from '../../constants'
import { SpeciesList } from '../../styles'
import { CatchMessageZone } from '../common/CatchMessageZone'
import { SpecyCatch } from '../common/SpecyCatch'

export function Haul({ hasManyHauls, haul, haulNumber }) {
  const catchesWithProperties = useMemo(() => {
    if (!haul?.catches) {
      return []
    }

    return buildCatchArray(haul.catches)
  }, [haul])

  return (
    <>
      {haul && (
        <>
          {hasManyHauls ? <HaulNumber data-cy="logbook-haul-number">Trait de pêche {haulNumber}</HaulNumber> : null}
          <CatchMessageZone
            datetimeUtc={haul.farDatetimeUtc}
            dimensions={haul.dimensions}
            gear={haul.gear}
            gearName={haul.gearName}
            latitude={haul.latitude}
            longitude={haul.longitude}
            mesh={haul.mesh}
          />
          <SpeciesList $hasCatches={!!catchesWithProperties.length}>
            {catchesWithProperties.map((speciesCatch, index) => (
              <SpecyCatch
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                specyCatch={speciesCatch}
                weightType={WeightType.LIVE}
              >
                {speciesCatch.properties.map((specyCatch, specyIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <CatchDetails key={specyIndex} specyCatch={specyCatch} weightType={WeightType.LIVE} />
                ))}
              </SpecyCatch>
            ))}
          </SpeciesList>
        </>
      )}
    </>
  )
}

const HaulNumber = styled.div`
  padding: 5px;
  display: block;
  height: 20px;
  padding-left: 10px;
  margin: 10px -10px 5px -10px;
  background: ${p => p.theme.color.lightGray};
`
