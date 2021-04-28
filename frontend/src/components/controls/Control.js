import React, { useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { ReactComponent as GyroGreenSVG } from '../icons/Gyrophare_controles_vert.svg'
import { ReactComponent as GyroRedSVG } from '../icons/Gyrophare_controles_rouge.svg'
import { getCoordinates, getDate } from '../../utils'
import { WSG84_PROJECTION } from '../../domain/entities/map'
import { controlType } from '../../domain/entities/controls'

const Control = props => {
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  return props.control
    ? <Wrapper key={props.index} isLastItem={props.isLastItem}>
        <Title>
            {
                props.control.infractions && props.control.infractions.length ? <GyroRed /> : <GyroGreen />
            }
            CONTRÔLE DU { getDate(props.control.controlDatetimeUtc) }
            {
                props.control.seizure
                  ? <ResumeBox>
                      <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                      <ResumeBoxText>Appréhension</ResumeBoxText>
                  </ResumeBox>
                  : null
            }
            {
                props.control.diversion
                  ? <ResumeBox>
                      <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                      <ResumeBoxText>Déroutement</ResumeBoxText>
                  </ResumeBox>
                  : null
            }
            {
                props.control.escortToQuay
                  ? <ResumeBox>
                      <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                      <ResumeBoxText>Reconduite à quai</ResumeBoxText>
                  </ResumeBox>
                  : null
            }
        </Title>
        <Key width={47}>Type</Key>
        <SubValue>
            { props.control.controlType }
        </SubValue><br/>
        <Key width={47}>Façade</Key>
        <SubValue>
            {props.control.facade ? <>{props.control.facade}</> : <NoValue>-</NoValue>}
        </SubValue><br/>
        {
            (props.control.controlType === controlType.AERIAL) || (props.control.controlType === controlType.SEA)
              ? <SubFields>
                  <SubField>
                      <Key width={47}>Lat.</Key>
                      <SubValue>{(props.control.latitude || props.control.latitude === 0) && (props.control.longitude || props.control.longitude === 0) ? <>{getCoordinates([props.control.latitude, props.control.longitude], WSG84_PROJECTION)[0]}</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField><br/>
                  <SubField>
                      <Key width={25}>Lon.</Key>
                      <SubValue>{(props.control.latitude || props.control.latitude === 0) && (props.control.longitude || props.control.longitude === 0) ? <>{getCoordinates([props.control.latitude, props.control.longitude], WSG84_PROJECTION)[1]}</> : <NoValue>-</NoValue>}</SubValue>
                  </SubField>
              </SubFields>
              : null
        }
        {
            props.control.controlType === controlType.LAND
              ? <>
                  <Key width={47}>Port</Key>
                  <SubValue>
                      {props.control.portName ? <>{props.control.portName} ({props.control.portLocode})</> : props.control.portLocode}
                  </SubValue>
              </>
              : null
        }
        <SubFields>
            <SubField>
                <Key width={47}>Admin.</Key>
                <SubValue>{props.control.controller && props.control.controller.administration ? <>{props.control.controller.administration}</> : <NoValue>-</NoValue>}</SubValue>
            </SubField>
            <SubField>
                <SubKey>Unité</SubKey>
                <SubValue>{props.control.controller && props.control.controller.controller ? <>{props.control.controller.controller}</> : <NoValue>-</NoValue>}</SubValue>
            </SubField>
        </SubFields>
        <Key width={47}>Résultat</Key>
        <SubValue>
            { props.control.infractions && props.control.infractions.length ? `${props.control.infractions.length} infraction${props.control.infractions.length > 1 ? 's' : ''}` : 'pas d\'infraction' }
        </SubValue><br/>
        {
            props.control.seizure
              ? <>
                  <Key width={80}>Appréhension</Key>
                  <SubValue>
                      { props.control.seizureComment }
                  </SubValue><br/>
              </>
              : null
        }
        <Key width={80}>Observations</Key>
        <SubValue>
            <Comment>
                { props.control.postControlComments ? props.control.postControlComments : <NoValue>-</NoValue> }
            </Comment>
        </SubValue>
        {
            props.control.infractions && props.control.infractions.length
              ? <Infractions>
                  {
                      props.control.infractions.map((infraction, index) => {
                        return <Infraction key={infraction.infractionCategory + index}>
                              <Line>
                                  <InfractionKey>infraction {index + 1}</InfractionKey>
                                  <InfractionValue>
                                      { infraction.infractionCategory }
                                  </InfractionValue>
                              </Line>
                              <Line>
                                  <InfractionKey>Description</InfractionKey>
                                  <InfractionValue>
                                      NATINF { infraction.natinfCode } - { infraction.infraction } - { infraction.regulation }
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
                      { props.control.missionOrder ? 'Oui' : 'Non' }
                  </SubValue><br/>
                  <Key width={135}>Navire ciblé</Key>
                  <SubValue>
                      { props.control.vesselTargeted ? 'Oui' : 'Non' }
                  </SubValue><br/>
                  <Key width={135}>Contrôle des engins</Key>
                  <SubValue>
                      { props.control.gearControls && props.control.gearControls.length ? 'Oui' : 'Non' }
                  </SubValue><br/>
                  {
                      props.control.gearControls && props.control.gearControls.length
                        ? props.control.gearControls.map((gear, index) => {
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
                      { props.control.cooperative === false ? 'Coopératif' : 'Non coopératif' }
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
  color: ${COLORS.textGray};
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
  color: ${COLORS.grayDarkerThree};
  margin: 0 10px 0 5px;
  font-weight: medium;
`

const ResumeBoxNumber = styled.span`
  background: ${props => props.isRed ? COLORS.red : COLORS.grayDarkerThree};
  color: ${COLORS.grayBackground};
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
  background: ${COLORS.grayLighter};
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
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
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
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
`

const Key = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
  width: ${props => props.width ? props.width : '47'}px;
  display: inline-block;
`

const InfractionKey = styled.th`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
  width: 80px;
  display: inline-block;
  border: none;
  background: none;
  font-weight: normal;
`

const InfractionValue = styled.th`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
  flex: initial;
  display: inline-block;
  margin: 0;
  background: none;
  font-weight: normal;
  width: 350px;
  white-space: break-spaces;
  vertical-align: top;
  padding-top: 4px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
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
