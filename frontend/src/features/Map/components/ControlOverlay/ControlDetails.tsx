import { Flag } from '@features/commonComponents/Flag'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, Tag, THEME } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import { getInfractionTitle } from '../../../../domain/entities/controls'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { missionFormActions } from '../../../Mission/components/MissionForm/slice'

import type { Mission } from '../../../Mission/mission.types'

type ControlDetailsProps = Readonly<{
  control: Mission.MissionActionFeatureProperties
  isSelected: boolean
}>

export function ControlDetails({ control, isSelected }: ControlDetailsProps) {
  const dispatch = useMainAppDispatch()

  const numberOfInfractions = useMemo(() => {
    const allInfractionsText = `${control.numberOfInfractions ? control.numberOfInfractions : 'Aucune'} ${pluralize(
      'infraction',
      control.numberOfInfractions
    )}`

    if (!control.numberOfInfractions) {
      return (
        <div>
          {allInfractionsText} <GreenCircle $margin="2" />
        </div>
      )
    }

    if (control.numberOfInfractions && !control.numberOfInfractionsWithRecords) {
      return (
        <div>
          {allInfractionsText} sans PV <GreenCircle $margin="2" />
        </div>
      )
    }

    if (control.numberOfInfractions === control.numberOfInfractionsWithRecords) {
      return (
        <div>
          {allInfractionsText} avec PV <RedCircle $margin="2" />
        </div>
      )
    }

    return (
      <div>
        {allInfractionsText} dont {control.numberOfInfractionsWithRecords} avec PV <RedCircle $margin="2" />
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
            title="Fermer"
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
              <Tag accent={Accent.PRIMARY} Icon={Icon.CircleFilled} iconColor={THEME.color.maximumRed} withCircleIcon>
                Appréhension espèce
              </Tag>
            )}
            {control.hasGearSeized && !control.hasSpeciesSeized && (
              <Tag accent={Accent.PRIMARY} Icon={Icon.CircleFilled} iconColor={THEME.color.maximumRed} withCircleIcon>
                Appréhension engin
              </Tag>
            )}
            {control.hasSpeciesSeized && control.hasGearSeized && (
              <>
                <Tag accent={Accent.PRIMARY} Icon={Icon.CircleFilled} iconColor={THEME.color.maximumRed} withCircleIcon>
                  Appréhension engin
                </Tag>{' '}
                et 1 autre
              </>
            )}
            {control.infractions.map(infraction => (
              <StyledTag accent={Accent.PRIMARY} title={getInfractionTitle(infraction)}>
                {`${infraction.threatCharacterization} / NATINF ${infraction.natinf}`}
              </StyledTag>
            ))}
          </SeizureOrInfractions>
        </ZoneText>
      </Wrapper>
    </>
  )
}

const StyledTag = styled(Tag)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  max-width: 250px;
`

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
  box-shadow: 0 3px 6px #70778540;
  line-height: 20px;
  text-align: left;
  width: 310px;
  border-radius: 1px;
  overflow: auto;
  background-color: ${p => p.theme.color.white};
`

const ZoneText = styled.div`
  margin: 11px 12px 0 12px;
  font-size: 13px;
`
