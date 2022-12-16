import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { ReactComponent as GyroGreenSVG } from '../../icons/Gyrophare_controles_vert.svg'
import { ReactComponent as GyroRedSVG } from '../../icons/Gyrophare_controles_rouge.svg'
import { getCoordinates } from '../../../coordinates'
import { getDate } from '../../../utils'
import { WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { controlType, getNumberOfInfractions } from '../../../domain/entities/controls'
import { useSelector } from 'react-redux'

const Control = props => {
  const { coordinatesFormat } = useSelector(state => state.map)

  const {
    /** @type {VesselControl} control */
    control,
    index,
    isLastItem
  } = props

  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const numberOfInfractions = useMemo(() => {
    return getNumberOfInfractions(control)
  }, [control])

  return control
    ? <Wrapper key={index} isLastItem={isLastItem}>
      <Title data-cy={'vessel-controls-title'}>
        {
          numberOfInfractions ? <GyroRed/> : <GyroGreen/>
        }
        CONTRÔLE DU {getDate(control.controlDatetimeUtc)}
        {
          control.seizure
            ? <ResumeBox>
              <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
              <ResumeBoxText>Appréhension</ResumeBoxText>
            </ResumeBox>
            : null
        }
        {
          control.diversion
            ? <ResumeBox>
              <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
              <ResumeBoxText>Déroutement</ResumeBoxText>
            </ResumeBox>
            : null
        }
        {
          control.escortToQuay
            ? <ResumeBox>
              <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
              <ResumeBoxText>Reconduite à quai</ResumeBoxText>
            </ResumeBox>
            : null
        }
      </Title>
      <Key width={47}>Type</Key>
      <SubValue>
        {control.controlType}
      </SubValue><br/>
      <Key width={47}>Façade</Key>
      <SubValue>
        {control.facade ? <>{control.facade}</> : <NoValue>-</NoValue>}
      </SubValue><br/>
      {
        (control.controlType === controlType.AERIAL) || (control.controlType === controlType.SEA)
          ? <SubFields>
            <SubField>
              <Key width={47}>Lat.</Key>
              <SubValue>{(control.latitude || control.latitude === 0) && (control.longitude || control.longitude === 0)
                ? <>{getCoordinates([control.longitude, control.latitude], WSG84_PROJECTION, coordinatesFormat)[0]}</>
                : <NoValue>-</NoValue>}</SubValue>
            </SubField><br/>
            <SubField>
              <Key width={25}>Lon.</Key>
              <SubValue>{(control.latitude || control.latitude === 0) && (control.longitude || control.longitude === 0)
                ? <>{getCoordinates([control.longitude, control.latitude], WSG84_PROJECTION, coordinatesFormat)[1]}</>
                : <NoValue>-</NoValue>}</SubValue>
            </SubField>
          </SubFields>
          : null
      }
      {
        control.controlType === controlType.LAND
          ? <>
            <Key width={47}>Port</Key>
            <SubValue>
              {control.portName ? <>{control.portName} ({control.portLocode})</> : control.portLocode}
            </SubValue>
          </>
          : null
      }
      <SubFields>
        <SubField>
          <Key width={47}>Admin.</Key>
          <SubValue>{control.controller && control.controller.administration
            ? <>{control.controller.administration}</>
            : <NoValue>-</NoValue>}</SubValue>
        </SubField>
        <SubField>
          <SubKey>Unité</SubKey>
          <SubValue>{control.controller && control.controller.controller
            ? <>{control.controller.controller}</>
            : <NoValue>-</NoValue>}</SubValue>
        </SubField>
      </SubFields>
      <Key width={47}>Résultat</Key>
      <SubValue>
        {numberOfInfractions ? `${numberOfInfractions} infraction${numberOfInfractions > 1 ? 's' : ''}` : 'pas d\'infraction'}
      </SubValue><br/>
      {
        control.seizure
          ? <>
            <Key width={85}>Appréhension</Key>
            <Comment>
              {control.seizureComments}
            </Comment><br/>
          </>
          : null
      }
      <Key width={80}>Observations</Key>
      <SubValue>
        <Comment>
          {control.postControlComments ? control.postControlComments : <NoValue>-</NoValue>}
        </Comment>
      </SubValue>
      {
        control.infractions && control.infractions.length
          ? <Infractions>
            {
              control.infractions.map((infraction, index) => {
                return <Infraction key={infraction.infractionCategory + index}>
                  <Line>
                    <InfractionKey>infraction {index + 1}</InfractionKey>
                    <InfractionValue>
                      {infraction.infractionCategory}
                    </InfractionValue>
                  </Line>
                  <Line>
                    <InfractionKey>Description</InfractionKey>
                    <InfractionValue>
                      NATINF {infraction.natinfCode} - {infraction.infraction} - {infraction.regulation}
                    </InfractionValue>
                  </Line>
                </Infraction>
              })
            }
          </Infractions>
          : null
      }
      {
        seeMoreIsOpen
          ? <More>
            <Key width={135}>Contrôle sur OM</Key>
            <SubValue>
              {control.missionOrder ? 'Oui' : 'Non'}
            </SubValue><br/>
            <Key width={135}>Navire ciblé</Key>
            <SubValue>
              {control.vesselTargeted ? 'Oui' : 'Non'}
            </SubValue><br/>
            <Key width={135}>Contrôle des engins</Key>
            <SubValue>
              {control.gearControls && control.gearControls.length ? 'Oui' : 'Non'}
            </SubValue><br/>
            {
              control.gearControls && control.gearControls.length
                ? control.gearControls.map((gear, index) => {
                  return <Gear key={gear.gearCode + index}>
                    <Key width={100}>Engin {index + 1}</Key>
                    <SubValue>
                      {gear.gearName ? <>{gear.gearName} ({gear.gearCode})</> : gear.gearCode}
                    </SubValue><br/>
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
                })
                : null
            }
            <Key width={135}>Contexte du contrôle</Key>
            <SubValue>
              {control.cooperative === false ? 'Coopératif' : 'Non coopératif'}
            </SubValue>
          </More>
          : null
      }
      <SeeMore onClick={() => setSeeMoreIsOpen(!seeMoreIsOpen)}>
        Voir {seeMoreIsOpen ? 'moins' : 'plus'} de détails
      </SeeMore>
    </Wrapper>
    : null
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

const ResumeBoxNumber = styled.span`
  background: ${props => props.isRed ? COLORS.maximumRed : COLORS.charcoal};
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

const Wrapper = styled.div`
  width: -moz-available;
  width: -webkit-fill-available;
  padding: 10px 10px 10px 20px;
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${props.theme.color.lightGray};` : null}
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  vertical-align: sub;
`

const Key = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
  width: ${props => props.width ? props.width : '47'}px;
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

export default Control
