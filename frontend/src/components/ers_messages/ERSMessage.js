import React from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";
import {ReactComponent as XMLSVG} from '../icons/Picto_XML.svg'
import {getDateTime} from "../../utils";
import DEPMessage from "./DEPMessage";
import FARMessage from "./FARMessage";
import EOFMessage from "./EOFMessage";
import PNOMessage from "./PNOMessage";
import RTPMessage from "./RTPMessage";
import LANMessage from "./LANMessage";

const ERSMessage = props => {
    const getERSMessageHeaderTitle = message => {
        switch (message.messageType) {
            case ERSMessageTypeEnum.DEP.code.toString(): {
                return <>
                    <ERSMessageName>{ERSMessageTypeEnum[message.messageType].name}</ERSMessageName>
                    {message.message.departurePortName ? message.message.departurePortName : message.message.departurePort}
                    {' '}le {getDateTime(message.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
            }
            case ERSMessageTypeEnum.PNO.code.toString(): {
                return 'Préavis (notification de retour au port)'
            }
            case ERSMessageTypeEnum.FAR.code.toString(): {
                return 'Déclaration de capture'
            }
            case ERSMessageTypeEnum.COE.code.toString(): {
                return 'Entrée dans une zone d\'effort'
            }
            case ERSMessageTypeEnum.COX.code.toString(): {
                return 'Sortie d\'une zone d\'effort'
            }
            case ERSMessageTypeEnum.CRO.code.toString(): {
                return 'Traversée d\'une zone d\'effort'
            }
            case ERSMessageTypeEnum.DIS.code.toString(): {
                return 'Déclaration de rejets'
            }
            case ERSMessageTypeEnum.EOF.code.toString(): {
                return 'Fin de pêche'
            }
            case ERSMessageTypeEnum.RTP.code.toString(): {
                return 'Retour au port'
            }
            case ERSMessageTypeEnum.LAN.code.toString(): {
                return 'Débarquement'
            }
        }
    }

    const openXML = xml => {
        xml = xml.replace('<ers:OPS', '<ers:OPS xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" ' +
            'xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" ' +
            'xmlns:tns="http://ec.europa.eu/fisheries/schema/ers/wsdl/v3" ' +
            'xmlns:ers="http://ec.europa.eu/fisheries/schema/ers/v3" ' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema"')
        let blob = new Blob([xml], { type: 'text/xml' });
        let url = URL.createObjectURL(blob);
        window.open(url);
        URL.revokeObjectURL(url);
    }

    const getERSMessage = ersMessage => {
        switch (ersMessage.messageType) {
            case ERSMessageTypeEnum.DEP.code.toString(): {
                return <DEPMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.FAR.code.toString(): {
                return <FARMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.EOF.code.toString(): {
                return <EOFMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.PNO.code.toString(): {
                return <PNOMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.RTP.code.toString(): {
                return <RTPMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.LAN.code.toString(): {
                return <LANMessage message={ersMessage.message} />
            }
        }
    }

    return <>
        { props.message ?
            <Wrapper>
                <Header>
                    <ERSMessageType>{props.message.messageType}</ERSMessageType>
                    <ERSMessageHeaderText>
                        {getERSMessageHeaderTitle(props.message)}
                    </ERSMessageHeaderText>
                    {
                        props.message.rawMessage ? <XML
                            title="Ouvrir le message XML brut"
                            style={{cursor: 'pointer'}}
                            onClick={() => openXML(props.message.rawMessage)}/> : <XML />
                    }
                </Header>
                <Body>
                    <ERSMessageMetadata>
                        <EmissionDateTime>
                            <Key>Date d'émission</Key><br/>
                            {getDateTime(props.message.operationDateTime, true)}
                        </EmissionDateTime>
                        <ReceptionDateTime>
                            <Key>Date de réception</Key><br/>
                            {getDateTime(props.message.operationDateTime, true)}
                        </ReceptionDateTime>
                        <VoyageNumber>
                            <Key>N° de marée</Key><br/>
                            12516165
                        </VoyageNumber>
                    </ERSMessageMetadata>
                    {getERSMessage(props.message)}
                </Body>
            </Wrapper>
             : null }
    </>
}

const Key = styled.span`
  color: ${COLORS.textGray};
`

const VoyageNumber = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 10px 9px 10px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const ReceptionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 10px 9px 10px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const EmissionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 10px 9px 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const ERSMessageMetadata = styled.div`
 display: flex;
`

const Body = styled.div`
  padding: 10px;
  background: ${COLORS.grayBackground};
`

const Wrapper = styled.div`
  margin-top: 10px;
  font-size: 13px;
  background: ${COLORS.background};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${COLORS.grayDarkerThree};
  display: flex;
`

const Gray = styled.span`
  color: ${COLORS.grayDarker};
  font-weight: 300;
`

const ERSMessageHeaderText = styled.span`
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 5px;
  padding: 3px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
`


const ERSMessageName = styled.span`
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
`

const ERSMessageType = styled.span`
  border: 1px solid ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 0;
  padding: 1px 2px 1px 2px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  width: 31px;
  display: inline-block;
  text-align: center;
`

const XML = styled(XMLSVG)`
  margin-left: auto;
  margin-top: 6.5px;
  margin-right: 10px;
  user-select: none;
  
  tspan {
    font-size: 9px;
  }
`

export default ERSMessage
