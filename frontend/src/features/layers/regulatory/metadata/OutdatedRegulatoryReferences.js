import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { COLORS } from '../../../../constants/constants'
import { ReactComponent as AlertSVG } from '../../../icons/Picto_alerte.svg'
import { INFINITE } from '../../../backoffice/constants'

const OutdatedRegulatoryReferences = () => {
  const {
    hasOneRegulatoryReference,
    referenceIsOutdated
  } = useSelector(state => {
    const today = new Date()
    const hasOneRegulatoryReference = state.regulatory.regulatoryZoneMetadata?.regulatoryReferences?.length === 1
    let referenceIsOutdated = false

    if (Array.isArray(state.regulatory.regulatoryZoneMetadata?.regulatoryReferences)) {
      state.regulatory.regulatoryZoneMetadata?.regulatoryReferences.forEach(reference => {
        if (reference?.endDate && reference.endDate !== INFINITE) {
          referenceIsOutdated = new Date(reference?.endDate) < today || referenceIsOutdated
        }
      })
    }

    return {
      hasOneRegulatoryReference,
      referenceIsOutdated
    }
  })

  return <>
    {
      referenceIsOutdated && <Warning>
        <WarningIcon/>
        {
          hasOneRegulatoryReference
            ? 'La'
            : 'Une'
        }{' '}
        réglementation de cette zone n&apos;est plus valide.
      </Warning>
    }
    </>
}

const Warning = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.orange};
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

export default OutdatedRegulatoryReferences
