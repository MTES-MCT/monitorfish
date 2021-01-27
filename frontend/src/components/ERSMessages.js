import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../domain/entities/ERS";
import ERSMessageResume from "./ers_messages_resumes/ERSMessageResume";
import ERSMessage from "./ers_messages/ERSMessage";

const ERSMessages = props => {
    return <Wrapper>
        <Previous onClick={() => props.showFishingActivitiesSummary()}>Revenir au résumé</Previous>
        { props.fishingActivities && props.fishingActivities.length ?
            props.fishingActivities.map(message => {
                return <ERSMessage key={message.ersId} message={message}/>
            }) : null }
    </Wrapper>
}
const Wrapper = styled.div`
  text-align: left;
  background: ${COLORS.background};
`

const Previous = styled.a`
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.textGray};
  margin: 5px 0px 0 10px;
  cursor: pointer;
  display: inline-block;
`

export default ERSMessages
