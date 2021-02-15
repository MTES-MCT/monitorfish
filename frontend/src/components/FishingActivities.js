import React, {useState} from "react";
import FishingActivitiesSummary from "./FishingActivitiesSummary";
import ERSMessages from "./ERSMessages";

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

export default FishingActivities
