import React from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";
import {getDateTime} from "../../utils";
import DEPMessage from "./DEPMessage";
import FARMessage from "./FARMessage";

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
            case ERSMessageTypeEnum.DIS.code.toString(): {
                return 'Déclaration de rejets'
            }
        }
    }

    const getERSMessage = ersMessage => {
        switch (ersMessage.messageType) {
            case ERSMessageTypeEnum.DEP.code: {
                return <DEPMessage message={ersMessage.message} />
            }
            case ERSMessageTypeEnum.FAR.code: {
                return <FARMessage message={ersMessage.message} />
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
  margin: 10px;
  font-size: 13px;
  background: ${COLORS.background};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${COLORS.grayDarkerThree};
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const ERSMessageHeaderText = styled.span`
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 5px;
  padding: 2px 4px 2px 0;
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

export default ERSMessage
