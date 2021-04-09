import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../constants/constants'
import { ReactComponent as GyroSVG } from './icons/Gyrophare_controles_gris.svg'
import { ReactComponent as WarningSVG } from './icons/Attention_controles.svg'
import YearControls from './YearControls'

const VesselControls = props => {
    const [yearsToControls, setYearsToControls] = useState({})

    useEffect(() => {
        if(props.controlResumeAndControls && props.controlResumeAndControls.controls) {
            let nextYearsToControls = {}

            props.controlResumeAndControls.controls.forEach(control => {
                const year = new Date(control.controlDatetimeUtc).getUTCFullYear()

                if(control.controlDatetimeUtc) {
                    if(nextYearsToControls[year] && nextYearsToControls[year].length) {
                        nextYearsToControls[year] = nextYearsToControls[year].concat(control)
                    } else {
                        nextYearsToControls[year] = [control]
                    }
                }
            })

            setYearsToControls(nextYearsToControls)
        }
    }, [props.controlResumeAndControls])

    return <>
        { props.nextControlResumeAndControls ?
            <>
                <UpdateControls/>
                <UpdateControlsButton
                    onClick={() => props.updateControlResumeAndControls(props.nextControlResumeAndControls)}>
                    Nouveaux contrôles
                </UpdateControlsButton>
            </> : null
        }
        {
            props.controlResumeAndControls ?
              <Body>
                  <Zone>
                      <Title>
                          <Text>
                              Résumé des actions de contrôle depuis { props.controlsFromDate ? <>{props.controlsFromDate.getUTCFullYear()}
                            {' '}(sur { new Date().getFullYear() - props.controlsFromDate.getUTCFullYear() } ans)</> : <NoValue>-</NoValue> }
                          </Text>
                      </Title>
                      <Fields>
                          <ControlResumeLine>
                              <ResumeText>
                                  <Gyro /> Nombre de contrôles
                              </ResumeText>
                              <ControlResumeNumberElement>en mer <Number>{!isNaN(props.controlResumeAndControls.numberOfSeaControls) ? props.controlResumeAndControls.numberOfSeaControls : <NoValue>-</NoValue>}</Number></ControlResumeNumberElement>
                              <ControlResumeNumberElement>débarque <Number>{!isNaN(props.controlResumeAndControls.numberOfLandControls) ? props.controlResumeAndControls.numberOfLandControls : <NoValue>-</NoValue>}</Number></ControlResumeNumberElement>
                              <ControlResumeNumberElement>aérien <Number>{!isNaN(props.controlResumeAndControls.numberOfAerialControls) ? props.controlResumeAndControls.numberOfAerialControls : <NoValue>-</NoValue>}</Number></ControlResumeNumberElement>
                          </ControlResumeLine>
                          <ControlResumeLine>
                              <ResumeText>
                                  <Warning /> Nombre d'infractions
                              </ResumeText>
                              <ControlResumeNumberElement>pêche <Number>{!isNaN(props.controlResumeAndControls.numberOfFishingInfractions) ? props.controlResumeAndControls.numberOfFishingInfractions : <NoValue>-</NoValue>}</Number></ControlResumeNumberElement>
                              <ControlResumeNumberElement>sécurité <Number>{ !isNaN(props.controlResumeAndControls.numberOfSecurityInfractions) ? props.controlResumeAndControls.numberOfFishingInfractions : <NoValue>-</NoValue> }</Number></ControlResumeNumberElement>
                          </ControlResumeLine>
                          <ResumeBox>
                              <ResumeBoxNumber isRed={ props.controlResumeAndControls.numberOfDiversions }>{ !isNaN(props.controlResumeAndControls.numberOfDiversions) ? props.controlResumeAndControls.numberOfDiversions : <NoValue>-</NoValue> }</ResumeBoxNumber>
                              <ResumeBoxText>Déroutement</ResumeBoxText>
                          </ResumeBox>
                          <ResumeBox>
                              <ResumeBoxNumber isRed={ props.controlResumeAndControls.numberOfEscortsToQuay }>{ !isNaN(props.controlResumeAndControls.numberOfEscortsToQuay) ? props.controlResumeAndControls.numberOfEscortsToQuay : <NoValue>-</NoValue> }</ResumeBoxNumber>
                              <ResumeBoxText>Reconduite à quai</ResumeBoxText>
                          </ResumeBox>
                          <ResumeBox>
                              <ResumeBoxNumber isRed={ props.controlResumeAndControls.numberOfSeizures }>{ !isNaN(props.controlResumeAndControls.numberOfSeizures) ? props.controlResumeAndControls.numberOfSeizures : <NoValue>-</NoValue>}</ResumeBoxNumber>
                              <ResumeBoxText>Appréhension</ResumeBoxText>
                          </ResumeBox>
                      </Fields>
                  </Zone>
                  <Zone>
                      <Title>
                          <Text>
                              Contrôles
                          </Text>
                      </Title>
                      {
                          yearsToControls && Object.keys(yearsToControls).length ?
                            <List>
                                {
                                    Object.keys(yearsToControls)
                                      .sort((a, b) => b - a)
                                      .map((year, index) => {
                                          return <YearControls
                                            key={year + index}
                                            year={year}
                                            yearControls={yearsToControls[year]}
                                            isLastItem={yearsToControls[year].length === index + 1}
                                          />
                                    })
                                }
                            </List> : <NoControls>
                                Aucun contrôle { props.controlsFromDate ? <>depuis {props.controlsFromDate.getUTCFullYear()}</> : null}
                            </NoControls>
                      }
                  </Zone>
                  <SeeMoreBackground>
                      <SeeMore onClick={() => {
                          let nextDate = new Date(props.controlsFromDate.getTime())
                          nextDate.setMonth(nextDate.getMonth() - 12)

                          props.setControlFromDate(nextDate)
                      }}>
                          Afficher plus de contrôles
                      </SeeMore>
                  </SeeMoreBackground>
              </Body> : null
        }
        </>
}

const NoControls = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  width: 100%
`

const SeeMoreBackground = styled.div`
  background: ${COLORS.background};
  margin: 0px 5px 5px 5px;
  padding: 5px 0 5px 0;
`

const SeeMore = styled.div`
  border: 1px solid ${COLORS.grayDarkerThree};
  color: ${COLORS.grayDarkerThree};
  padding: 5px 10px 5px 10px;
  width: max-content;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  background: ${COLORS.background};
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
`

const ResumeBoxText = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin: 0 10px 0 5px;
  font-weight: medium;
`

const ResumeBoxNumber = styled.span`
  background: ${props => props.isRed ? COLORS.red : COLORS.grayDarkerThree };
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
  margin: 8px 15px 10px 0;
`

const Number = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin-left: 5px;
`

const UpdateControls = styled.div`
  background: ${COLORS.background};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0px rgba(81,81,81, 0.2);
  z-index: 9;
`

const UpdateControlsButton = styled.div`
  background: ${COLORS.grayDarkerThree};
  border-radius: 15px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  position: absolute;
  padding: 5px 10px 5px 10px;
  margin-top: 13px;
  margin-left: 166px;
  cursor: pointer;
  animation: pulse 2s infinite;
  z-index: 10;
  
  @-webkit-keyframes pulse {
  0% {
    -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
    box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -moz-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
      box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
      box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
`

const Text = styled.div`
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${props => props.hasTwoLines ? '6px' : '0'};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
`

const Title = styled.div`
  color: ${COLORS.textGray};
  background: ${COLORS.grayDarker};
  padding: 8.5px 10px 8px 20px;
  font-size: 0.8rem;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
`

const Zone = styled.div`
  margin: 5px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const Fields = styled.div`
  padding: 10px 5px 5px 20px; 
  width: 100%;
  margin: 0;
  line-height: 0.2em;
`

const ControlResumeLine = styled.div`
  margin: 0 5px 5px 0;
  border: none;
  background: none;
  font-size: 13px;
  color: ${COLORS.textGray};
  display: flex;
  flex: 1 1 1 1;
  width: 100%;
`

const ResumeText = styled.span`
  margin: 5px 10px 0 0;
`

const ControlResumeNumberElement = styled.span`
  margin: 5px 10px 0 15px;
`

const Gyro = styled(GyroSVG)`
  width: 16px;
  vertical-align: top;
  margin-right: 5px;
`

const Warning = styled(WarningSVG)`
  width: 16px;
  vertical-align: top;
  margin-right: 5px;
`

export default VesselControls
