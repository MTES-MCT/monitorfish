import { OverlayTrianglePointer } from '@features/Map/components/Overlay/OverlayTrianglePointer'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { Accent, Button, Dot, Icon, IconButton, Size, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { getDateTime, timeagoFrenchLocale } from '../../../../utils'
import { ReportingTypeCharacteristics } from '../../types'

import type { Reporting } from '../../types'
import type { OverlayCardMargins, OverlayPosition } from '@features/Map/components/Overlay/types'

const baseUrl = window.location.origin
// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

type ReportingDetailsProps = {
  cardHeight: number
  cardMargins: OverlayCardMargins
  hasTag: boolean
  isSelected: boolean
  onClose: () => void
  onDescriptionHeightChange: (height: number) => void
  onEdit: () => void
  overlayPosition?: OverlayPosition | undefined
  reporting: Reporting.ReportingFeature
}
export function ReportingDetails({
  cardHeight,
  cardMargins,
  hasTag,
  isSelected,
  onClose,
  onDescriptionHeightChange,
  onEdit,
  overlayPosition,
  reporting
}: ReportingDetailsProps) {
  const descriptionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = descriptionRef.current
    if (!el) {
      onDescriptionHeightChange(0)

      return undefined
    }

    const observer = new ResizeObserver(() => {
      onDescriptionHeightChange(el.clientHeight + 4)
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [reporting.description, onDescriptionHeightChange])
  const typeName = Object.values(ReportingTypeCharacteristics).find(c => c.code === reporting.type)?.displayName
  const color = reporting.type === ReportingType.OBSERVATION ? THEME.color.blueGray : THEME.color.maximumRed

  return (
    <>
      <Wrapper data-cy="reporting-overlay">
        <Header>
          <VesselName>
            <Flag rel="preload" src={`${baseUrl}/flags/${reporting.flagState.toLowerCase()}.svg`} />
            {reporting.vesselName ?? 'Navire inconnu'}
          </VesselName>
          {isSelected && (
            <CloseButton
              accent={Accent.TERTIARY}
              color={THEME.color.slateGray}
              data-cy="reporting-overlay-close"
              Icon={Icon.Close}
              iconSize={14}
              onClick={onClose}
              title="Fermer"
            />
          )}
        </Header>
        <Body>
          <Type>
            <Dot $backgroundColor={color} $borderColor={color} $size={0} />
            {typeName} ({reporting.from})
          </Type>
          <DateText>{getDateTime(reporting.reportingDate, true)}</DateText>
          {hasTag && (
            <Tags>
              {reporting.isIUU && <Tag accent={Accent.PRIMARY}>INN</Tag>}
              {reporting.isArchived && (
                <Tag backgroundColor={THEME.color.white} borderColor={THEME.color.gunMetal}>
                  Archivé
                </Tag>
              )}
              {!reporting.isArchived && reporting.expirationDate && (
                <Tag accent={Accent.PRIMARY} Icon={Icon.Clock} iconColor={THEME.color.slateGray} withCircleIcon>
                  Fin {timeago.format(reporting.expirationDate, 'fr')}
                </Tag>
              )}
            </Tags>
          )}
          <ThreatAndTitle>
            {reporting.threat && `${reporting.threat} / ${reporting.threatCharacterization} - `}
            {reporting.title}
          </ThreatAndTitle>
          {reporting.description && <Description ref={descriptionRef}>{reporting.description}</Description>}

          <EditButton
            accent={Accent.PRIMARY}
            disabled={reporting.type === ReportingType.ALERT}
            Icon={Icon.EditUnbordered}
            onClick={onEdit}
            size={Size.SMALL}
            title={
              reporting.type === ReportingType.ALERT
                ? `Un signalement provenant d'une alerte n'est pas modifiable`
                : undefined
            }
          >
            Modifier le signalement
          </EditButton>
        </Body>
      </Wrapper>
      {!isSelected && overlayPosition && (
        <OverlayTrianglePointer
          cardHeight={cardHeight}
          cardWidth={348}
          margins={cardMargins}
          overlayPosition={overlayPosition}
        />
      )}
    </>
  )
}

const Wrapper = styled.div`
  background: ${p => p.theme.color.white};
  padding: 12px;
  border-radius: 1px;
  box-shadow: 0 3px 6px #70778540;
  width: 324px;
`

const Tags = styled.div`
  display: inline-flex;
  gap: 8px;

  span {
    line-height: 20px;
  }
`

const EditButton = styled(Button)`
  margin-top: 16px;
  width: 190px;
`

const Header = styled.div`
  display: flex;
  height: 20px;
  margin-bottom: 4px;
`

const CloseButton = styled(IconButton)`
  margin-left: auto;
  flex-shrink: 0;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const VesselName = styled.div`
  font-weight: 700;
  color: ${p => p.theme.color.gunMetal};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Description = styled.div`
  color: ${p => p.theme.color.gunMetal};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
`

const Type = styled.div`
  color: ${p => p.theme.color.slateGray};
  align-items: baseline;
  display: inline-flex;
  gap: 4px;
`

const ThreatAndTitle = styled.div`
  margin-top: 12px;
  font-weight: 700;
  color: ${p => p.theme.color.gunMetal};
`

const DateText = styled.div`
  font-size: 11px;
  color: ${p => p.theme.color.slateGray};
  margin-bottom: 4px;
`

const Flag = styled.img<{
  rel?: 'preload'
}>`
  height: 14px;
  display: inline-block;
  vertical-align: sub;
  margin-right: 8px;
`
