import { Accent, Icon, IconButton, Tag, TagBullet, THEME } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import { margins } from './constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { pluralize } from '../../../../utils/pluralize'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { missionFormActions } from '../../../Mission/components/MissionForm/slice'
import { Flag } from '../../../VesselList/tableCells'
import { OverlayPosition } from '../Overlay'

import type { Mission } from '../../../Mission/mission.types'

type ControlDetailsProps = Readonly<{
  control: Mission.MissionActionFeatureProperties
  isSelected: boolean
  overlayPosition: OverlayPosition
}>
export function ControlDetails({ control, isSelected, overlayPosition }: ControlDetailsProps) {
  const dispatch = useMainAppDispatch()

  const numberOfInfractions = useMemo(() => {
    const allInfractionsText = `${control.numberOfInfractions ? control.numberOfInfractions : 'Aucune'} ${pluralize(
      'infraction',
      control.numberOfInfractions
    )}`

    if (!control.numberOfInfractions) {
      return (
        <div>
          {allInfractionsText} <GreenCircle margin="2" />
        </div>
      )
    }

    if (control.numberOfInfractions && !control.numberOfInfractionsWithRecords) {
      return (
        <div>
          {allInfractionsText} sans PV <GreenCircle margin="2" />
        </div>
      )
    }

    if (control.numberOfInfractions === control.numberOfInfractionsWithRecords) {
      return (
        <div>
          {allInfractionsText} avec PV <RedCircle margin="2" />
        </div>
      )
    }

    return (
      <div>
        {allInfractionsText} dont {control.numberOfInfractionsWithRecords} avec PV <RedCircle margin="2" />
      </div>
    )
  }, [control])

  return (
    <>
      <Wrapper data-cy="mission-action-overlay">
        {isSelected && (
          <CloseButton
            accent={Accent.TERTIARY}
            data-cy="mission-action-overlay-close"
            Icon={Icon.Close}
            iconSize={14}
            onClick={() => dispatch(missionFormActions.unsetSelectedMissionActionGeoJSON())}
          />
        )}
        <ZoneText>
          <Title>
            Contrôle du navire {control.vesselName ?? 'NOM INCONNU'}
            {control.flagState && (
              <Flag
                rel="preload"
                src={`flags/${control.flagState.toLowerCase()}.svg`}
                style={{ marginLeft: 8, marginTop: -2, width: 17 }}
                title={countries.getName(control.flagState.toLowerCase(), 'fr')}
              />
            )}
            {numberOfInfractions}
          </Title>
          <Details>{control.dateTime}</Details>
          <SeizureOrInfractions>
            {!control.hasGearSeized && control.hasSpeciesSeized && (
              <Tag accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
                Appréhension espèce
              </Tag>
            )}
            {control.hasGearSeized && !control.hasSpeciesSeized && (
              <Tag accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
                Appréhension engin
              </Tag>
            )}
            {control.hasSpeciesSeized && control.hasGearSeized && (
              <>
                <Tag accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
                  Appréhension engin
                </Tag>{' '}
                et 1 autre
              </>
            )}
            {!!control.infractionsNatinfs.length && (
              <Tag accent={Accent.PRIMARY} title={control.infractionsNatinfs.join(', ')}>
                {`${control.infractionsNatinfs.length} NATINF: ${control.infractionsNatinfs.join(', ')}`}
              </Tag>
            )}
          </SeizureOrInfractions>
        </ZoneText>
      </Wrapper>
      {!isSelected && (
        <TrianglePointer>
          {overlayPosition === OverlayPosition.BOTTOM && <BottomTriangleShadow />}
          {overlayPosition === OverlayPosition.TOP && <TopTriangleShadow />}
          {overlayPosition === OverlayPosition.RIGHT && <RightTriangleShadow />}
          {overlayPosition === OverlayPosition.LEFT && <LeftTriangleShadow />}
        </TrianglePointer>
      )}
    </>
  )
}

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 0;
  margin: 5px;
`

const Details = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-top: 4px;
`

const SeizureOrInfractions = styled.div`
  line-height: 22px;
  margin-top: 8px;
  margin-bottom: 6px;
  color: ${p => p.theme.color.slateGray};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Title = styled.div`
  height: 40px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font: normal normal bold 13px/18px Marianne;
  color: ${p => p.theme.color.gunMetal};
`

const Wrapper = styled.div`
  padding-top: 1px;
  box-shadow: 0px 3px 6px #70778540;
  line-height: 20px;
  text-align: left;
  height: 115px;
  width: 310px;
  border-radius: 1px;
  background-color: ${p => p.theme.color.white};
`

const ZoneText = styled.div`
  margin: 11px 12px 0px 12px;
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const BottomTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${p => p.theme.color.white} transparent transparent transparent;
  margin-left: ${-margins.xMiddle - 6}px;
  margin-top: -4px;
  clear: top;
`

const TopTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-top: transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid ${p => p.theme.color.white};
  border-left: 6px solid transparent;
  margin-left: ${-margins.xMiddle - 6}px;
  margin-top: ${margins.yBottom + 30}px;
  clear: top;
`

const RightTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-right: transparent;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 11px solid ${p => p.theme.color.white};
  margin-left: ${-margins.xRight - 30}px;
  margin-top: ${margins.yMiddle}px;
  clear: top;
`

const LeftTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-top: 6px solid transparent;
  border-right: 11px solid ${p => p.theme.color.white};
  border-bottom: 6px solid transparent;
  border-left: transparent;
  margin-left: -11px;
  margin-top: ${margins.yMiddle}px;
  clear: top;
`
