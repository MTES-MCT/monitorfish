import { INQUIRY_ORIGIN_LABEL } from '@features/Inquiry/constants'
import { Icon, Link, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ContentColumn, ControlCardTitle, ControlCardUnit, ControlCardWrapper, GyroColumn } from './Controls.style'
import { InquiryInfraction } from './InquiryInfraction'
import {
  getInquiryNumberOfInfractionsWithoutRecord,
  getInquiryNumberOfInfractionsWithRecord,
  isInquiryClosed
} from '../../../../../../domain/entities/controls'
import { getDate } from '../../../../../../utils'

import type { Inquiry as InquiryType } from '@features/Inquiry/Inquiry.types'

type InquiryProps = Readonly<{
  inquiry: InquiryType.Inquiry
}>

export function Inquiry({ inquiry }: InquiryProps) {
  const observationsRef = useRef<HTMLDivElement>(null)
  const [isObservationsOverflowing, setIsObservationsOverflowing] = useState(false)
  const [isObservationsOpen, setIsObservationsOpen] = useState(false)

  const isClosed = isInquiryClosed(inquiry)
  const numberOfInfractionsWithRecord = getInquiryNumberOfInfractionsWithRecord(inquiry)
  const numberOfInfractionsWithoutRecord = getInquiryNumberOfInfractionsWithoutRecord(inquiry)
  const observations = inquiry.observations.join('\n')

  useLayoutEffect(() => {
    const element = observationsRef.current
    if (!element || isObservationsOpen) {
      return
    }

    setIsObservationsOverflowing(element.scrollHeight > element.clientHeight)
  }, [isObservationsOpen])

  const iconColor = (function () {
    if (!isClosed) {
      return THEME.color.blueGray
    }
    if (numberOfInfractionsWithRecord > 0) {
      return THEME.color.maximumRed
    }
    if (numberOfInfractionsWithoutRecord > 0) {
      return THEME.color.goldenPoppy
    }

    return THEME.color.mediumSeaGreen
  })()

  const title = isClosed
    ? `CONTRÔLE CROISÉ DU ${getDate(inquiry.startDateTimeUtc)} AU ${getDate(inquiry.endDateTimeUtc)}`
    : `CONTRÔLE CROISÉ EN COURS - OUVERT LE ${getDate(inquiry.startDateTimeUtc)}`

  return (
    <ControlCardWrapper>
      <GyroColumn>
        <StyledMissionActionIcon color={iconColor} />
      </GyroColumn>
      <ContentColumn data-cy="vessel-inquiry">
        <ControlCardTitle data-cy="vessel-inquiry-title" title={title}>
          {title}
          {inquiry.service?.name && (
            <>
              <br />
              <ControlCardUnit>{inquiry.service.name}</ControlCardUnit>
            </>
          )}
        </ControlCardTitle>
        {inquiry.origin && (
          <OriginTag backgroundColor={THEME.color.white}>Origine : {INQUIRY_ORIGIN_LABEL[inquiry.origin]}</OriginTag>
        )}
        {isClosed && (
          <>
            {inquiry.infractions.map((infraction, index) => (
              <InquiryInfraction
                key={`${infraction.controlType}${infraction.natinfs.join()}${infraction.observations}`}
                hasMultipleInfraction={inquiry.infractions.length > 1}
                index={index + 1}
                infraction={infraction}
              />
            ))}
            {observations && (
              <>
                <Observations ref={observationsRef} $isOpen={isObservationsOpen}>
                  {observations}
                </Observations>
                {(isObservationsOverflowing || isObservationsOpen) && (
                  <SeeMore onClick={() => setIsObservationsOpen(!isObservationsOpen)}>
                    {isObservationsOpen ? 'Voir moins' : 'Voir plus'}
                  </SeeMore>
                )}
              </>
            )}
          </>
        )}
      </ContentColumn>
    </ControlCardWrapper>
  )
}

const StyledMissionActionIcon = styled(Icon.MissionAction)`
  margin-right: 8px;
`

const OriginTag = styled(Tag)`
  margin-top: 8px;
  font-weight: 500;
`

const Observations = styled.div<{
  $isOpen: boolean
}>`
  margin-top: 16px;
  padding-right: 24px;
  white-space: pre-wrap;
  ${p =>
    !p.$isOpen &&
    `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
  `}
`

const SeeMore = styled(Link)`
  cursor: pointer;
  display: block;
  margin-right: 24px;
  text-align: right;
`
