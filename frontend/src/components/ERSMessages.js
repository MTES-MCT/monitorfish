import React from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";
import ERSMessage from "./ers_messages/ERSMessage";
import {ReactComponent as ArrowSVG} from './icons/Picto_fleche-pleine-droite.svg'

const ERSMessages = props => {
    return <Wrapper>
        <Arrow onClick={() => props.showFishingActivitiesSummary()}/><Previous onClick={() => props.showFishingActivitiesSummary()}>Revenir au résumé</Previous>
        { props.fishingActivities && props.fishingActivities.length ?
            props.fishingActivities
                .filter(ersMessage =>{
                    if(props.messageTypeFilter) {
                        return ersMessage.messageType === props.messageTypeFilter
                    } else {
                        return true
                    }
                })
                .map(message => {
                return <ERSMessage key={message.ersId} message={message}/>
            }) : <NoMessage>Aucun message reçu</NoMessage> }
    </Wrapper>
}

const Arrow = styled(ArrowSVG)`
  vertical-align: sub;
  transform: rotate(180deg);
  margin-right: 5px
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 10px;
  padding-bottom: 30px;
  font-size: 13px;
  color: ${COLORS.textGray};
`

const Wrapper = styled.div`
  text-align: left;
  background: ${COLORS.background};
  padding: 5px 10px 10px 10px;
`

const Previous = styled.a`
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.textGray};
  cursor: pointer;
  display: inline-block;
`

export default ERSMessages
