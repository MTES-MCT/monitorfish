import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getCoordinates } from '../../../coordinates'
import { getNumberOfInfractions } from '../../../domain/entities/controls'
import { WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { MissionAction, MissionActionType } from '../../../domain/types/missionAction'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { getDate } from '../../../utils'
import { ReactComponent as GyroRedSVG } from '../../icons/Gyrophare_controles_rouge.svg'
import { ReactComponent as GyroGreenSVG } from '../../icons/Gyrophare_controles_vert.svg'

type ControlProps = {
  control: MissionAction
  isLastItem: boolean
}
export function Control({ control, isLastItem }: ControlProps) {
  const { coordinatesFormat } = useAppSelector(state => state.map)

  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const numberOfInfractions = useMemo(() => getNumberOfInfractions(control), [control])

  return control ? (
    <Wrapper isLastItem={isLastItem}>
      <Title data-cy="vessel-controls-title">
        {numberOfInfractions ? <GyroRed /> : <GyroGreen />}
        CONTRÔLE DU {getDate(control.actionDatetimeUtc)}
        {control.seizureAndDiversion && (
          <ResumeBox>
            <ResumeBoxNumber isRed>{1}</ResumeBoxNumber>
            <ResumeBoxText>Appréhension et déroutement</ResumeBoxText>
          </ResumeBox>
        )}
      </Title>
      <Key width={47}>Type</Key>
      <SubValue>{control.actionType}</SubValue>
      <br />
      <Key width={47}>Façade</Key>
      <SubValue>{control.facade ? <>{control.facade}</> : <NoValue>-</NoValue>}</SubValue>
      <br />
      {control.actionType === MissionActionType.AIR_CONTROL || control.actionType === MissionActionType.LAND_CONTROL ? (
        <SubFields>
          <SubField>
            <Key width={47}>Lat.</Key>
            <SubValue>
              {(control.latitude || control.latitude === 0) && (control.longitude || control.longitude === 0) ? (
                <>{getCoordinates([control.longitude, control.latitude], WSG84_PROJECTION, coordinatesFormat)[0]}</>
              ) : (
                <NoValue>-</NoValue>
              )}
            </SubValue>
          </SubField>
          <br />
          <SubField>
            <Key width={25}>Lon.</Key>
            <SubValue>
              {(control.latitude || control.latitude === 0) && (control.longitude || control.longitude === 0) ? (
                <>{getCoordinates([control.longitude, control.latitude], WSG84_PROJECTION, coordinatesFormat)[1]}</>
              ) : (
                <NoValue>-</NoValue>
              )}
            </SubValue>
          </SubField>
        </SubFields>
      ) : null}
      {control.actionType === MissionActionType.LAND_CONTROL ? (
        <>
          <Key width={47}>Port</Key>
          <SubValue>
            {control.portName ? (
              <>
                {control.portName} ({control.portLocode})
              </>
            ) : (
              control.portLocode
            )}
          </SubValue>
        </>
      ) : null}
      {control.controlUnits.map(controlUnit => (
        <SubFields>
          <SubField>
            <Key width={47}>Admin.</Key>
            <SubValue>{controlUnit.administration}</SubValue>
          </SubField>
          <SubField>
            <SubKey>Unité</SubKey>
            <SubValue>{controlUnit.name}</SubValue>
          </SubField>
        </SubFields>
      ))}
      <Key width={47}>Résultat</Key>
      <SubValue>
        {numberOfInfractions
          ? `${numberOfInfractions} infraction${numberOfInfractions > 1 ? 's' : ''}`
          : "pas d'infraction"}
      </SubValue>
      <br />
      {control.seizureAndDiversion && (
        <>
          <Key width={85}>Appréhension</Key>
          <Comment>{control.seizureAndDiversionComments}</Comment>
          <br />
        </>
      )}
      <Key width={80}>Observations</Key>
      <SubValue>
        <Comment>{control.otherComments || <NoValue>-</NoValue>}</Comment>
      </SubValue>
      {control.gearInfractions.length && (
        <Infractions>
          {control.gearInfractions.map((infraction, index) => (
            <Infraction key={infraction.infractionType + infraction.natinf}>
              <Line>
                <InfractionKey>infraction {index + 1}</InfractionKey>
                <InfractionValue>{infraction.infractionType}</InfractionValue>
              </Line>
              <Line>
                <InfractionKey>Description</InfractionKey>
                <InfractionValue>
                  NATINF {infraction.natinf} - {infraction.comments}
                </InfractionValue>
              </Line>
            </Infraction>
          ))}
        </Infractions>
      )}
      {seeMoreIsOpen && (
        <More>
          <Key width={135}>Navire ciblé</Key>
          <SubValue>{control.vesselTargeted ? 'Oui' : 'Non'}</SubValue>
          <br />
          {control.gearOnboard.map((gear, index) => (
            <Gear key={gear.gearCode + gear.comments}>
              <Key width={100}>Engin {index + 1}</Key>
              <SubValue>
                {gear.gearName ? (
                  <>
                    {gear.gearName} ({gear.gearCode})
                  </>
                ) : (
                  gear.gearCode
                )}
              </SubValue>
              <br />
              <SubFields>
                <SubField>
                  <Key width={100}>Maillage déclaré</Key>
                  <SubValue>{gear.declaredMesh ? <>{gear.declaredMesh}</> : <NoValue>-</NoValue>}</SubValue>
                </SubField>
                <SubField>
                  <SubKey>Maillage mesuré</SubKey>
                  <SubValue>{gear.controlledMesh ? <>{gear.controlledMesh}</> : <NoValue>-</NoValue>}</SubValue>
                </SubField>
              </SubFields>
            </Gear>
          ))}
        </More>
      )}
      <SeeMore onClick={() => setSeeMoreIsOpen(!seeMoreIsOpen)}>
        Voir {seeMoreIsOpen ? 'moins' : 'plus'} de détails
      </SeeMore>
    </Wrapper>
  ) : null
}

const Comment = styled.div`
  display: inline-block;
  margin: 0;
  background: none;
  font-weight: normal;
  width: 350px;
  white-space: break-spaces;
  vertical-align: top;
  padding-top: 4px;
  font-size: 13px;
  font-weight: 500;
`

const More = styled.div`
  margin-top: 10px;
`

const Gear = styled.div`
  margin-left: 20px;
`

const SeeMore = styled.a`
  margin-top: 10px;
  display: block;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.slateGray};
  cursor: pointer;
`

const Line = styled.tr`
  border: none;
`

const Infractions = styled.table`
  margin-top: 10px;
  border: none;
  padding: 0;
  overflow: hidden !important;
`

const Infraction = styled.div`
  margin-top: 5px;
`

const ResumeBoxText = styled.span`
  color: ${COLORS.gunMetal};
  margin: 0 10px 0 5px;
  font-weight: 500;
`

const ResumeBoxNumber = styled.span<{
  isRed: boolean
}>`
  background: ${p => (p.isRed ? COLORS.maximumRed : COLORS.charcoal)};
  color: ${COLORS.gainsboro};
  border-radius: 11px;
  height: 16px;
  display: inline-block;
  line-height: 15px;
  width: 16px;
  text-align: center;
  font-weight: bolder;
  margin: 3px 0 0 4px;
`

const ResumeBox = styled.span`
  background: ${p => p.theme.color.gainsboro};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  margin: 8px 15px 10px 10px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  margin-bottom: 5px;
  height: 40px;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const SubFields = styled.div`
  display: flex;
`

const SubField = styled.div`
  flex: 0 1 0;
`

const Wrapper = styled.div<{
  isLastItem: boolean
}>`
  width: -moz-available;
  width: -webkit-fill-available;
  padding: 10px 10px 10px 20px;
  ${p => (!p.isLastItem ? `border-bottom: 1px solid ${p.theme.color.lightGray};` : null)}
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  vertical-align: sub;
`

const Key = styled.span<{
  width: number | null
}>`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  width: ${p => (p.width ? p.width : '47')}px;
  display: inline-block;
  vertical-align: top;
  padding-top: 4px;
`

const InfractionKey = styled.th`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  width: 80px;
  display: inline-block;
  border: none;
  background: none;
  font-weight: normal;
`

const InfractionValue = styled.th`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
  flex: initial;
  display: inline-block;
  margin: 0;
  background: none;
  font-weight: normal;
  width: 350px;
  white-space: break-spaces;
  vertical-align: top;
  padding-top: 0px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin-right: 10px;
  font-weight: 500;
  vertical-align: bottom;
`

const GyroGreen = styled(GyroGreenSVG)`
  width: 16px;
  margin: 10px 10px 0 0;
  vertical-align: sub;
`

const GyroRed = styled(GyroRedSVG)`
  width: 16px;
  margin: 10px 10px 0 0;
  vertical-align: sub;
`
