import React, {useState} from "react";
import styled from "styled-components";

import FishingActivitiesSummary from "./FishingActivitiesSummary";
import ERSMessages from "../ers_messages/ERSMessages";
import {COLORS} from "../../constants/constants";

const FishingActivities = props => {
    const [fishingViewIndex, setFishingViewIndex] = useState(1)
    const [messageTypeFilter, setMessageTypeFilter] = useState(null)

    const showERSMessages = messageType => {
        if(messageType) {
            setMessageTypeFilter(messageType)
        } else {
            setMessageTypeFilter(null)
        }
        setFishingViewIndex(2)
    }

    const showFishingActivitiesSummary = () => {
        setFishingViewIndex(1)
    }

    return <>
        { props.nextFishingActivities ?
            <>
                <UpdateFishingActivities/>
                <UpdateFishingActivitiesButton
                    onClick={() => props.updateFishingActivities(props.nextFishingActivities)}>
                    Nouveaux messages JPE
                </UpdateFishingActivitiesButton>
            </> : null
        }
        { fishingViewIndex === 1 ?
            <FishingActivitiesSummary
                showERSMessages={showERSMessages}
                fishingActivities={props.fishingActivities}
            /> : null
        }
        { fishingViewIndex === 2 ?
            <ERSMessages
                showFishingActivitiesSummary={showFishingActivitiesSummary}
                fishingActivities={props.fishingActivities}
                messageTypeFilter={messageTypeFilter}
            /> : null }
        </>
}

const UpdateFishingActivities = styled.div`
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

const UpdateFishingActivitiesButton = styled.div`
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

export default FishingActivities
