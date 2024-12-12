import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import AlertSVG from '../../../icons/Picto_alerte.svg?react'
import { INFINITE } from '../RegulationTables/constants'

export function OutdatedRegulatoryReferences() {
  const { hasAtLeastOneOutdatedReference, hasOneRegulatoryReference } = useMainAppSelector(state => {
    const today = new Date()
    let nextHasAtLeastOneOutdatedReference = false

    if (Array.isArray(state.regulation.regulatoryZoneMetadata?.regulatoryReferences)) {
      state.regulation.regulatoryZoneMetadata?.regulatoryReferences.forEach(reference => {
        if (reference?.endDate && reference.endDate !== INFINITE) {
          nextHasAtLeastOneOutdatedReference =
            new Date(reference?.endDate) < today || nextHasAtLeastOneOutdatedReference
        }
      })
    }

    return {
      hasAtLeastOneOutdatedReference: nextHasAtLeastOneOutdatedReference,
      hasOneRegulatoryReference: state.regulation.regulatoryZoneMetadata?.regulatoryReferences?.length === 1
    }
  })

  return hasAtLeastOneOutdatedReference ? (
    <Warning>
      <WarningIcon />
      {hasOneRegulatoryReference ? 'La' : 'Une'} réglementation de cette zone n&apos;est plus valide.
    </Warning>
  ) : null
}

const Warning = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${p => p.theme.color.goldenPoppy};
  display: flex;
  text-align: left;
  font: normal normal bold 13px/18px Marianne;
  padding: 10px;
`

const WarningIcon = styled(AlertSVG)`
  height: 19px;
  width: 33px;
  margin: 0px 3px 0px 0;
  flex-grow: unset;
`
