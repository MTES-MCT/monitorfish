import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../../constants/constants";
import ERSMessage from "./ERSMessage";
import {ReactComponent as ArrowSVG} from '../../icons/Picto_fleche-pleine-droite.svg'
import {ReactComponent as SortSVG} from '../../icons/ascendant-descendant.svg'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'

const animatedComponents = makeAnimated();

const options = [
    { value: 'DEP', label: 'DEP' },
    { value: 'COE', label: 'COE' },
    { value: 'COX', label: 'COX' },
    { value: 'FAR', label: 'FAR' },
    { value: 'DIS', label: 'DIS/DIM' },
    { value: 'EOF', label: 'EOF' },
    { value: 'PNO', label: 'PNO' },
    { value: 'RTP', label: 'RTP' },
    { value: 'LAN', label: 'LAN' },
]

const ERSMessages = props => {
    const [fishingActivities, setFishingActivities] = useState([])
    const [ascendingSort, setAscendingSort] = useState(true)
    const [selectedOptions, setSelectedOptions] = useState(null);

    useEffect(() => {
        setFishingActivities(props.fishingActivities.ersMessages)
    }, [props.fishingActivities])

    useEffect(() => {
        let messageTypes = options.filter(options => options.value === props.messageTypeFilter)
        setSelectedOptions(messageTypes)
    }, [props.messageTypeFilter])

    function inverseSort() {
        let inversedSort = !ascendingSort

        const sortedFishingActivities = [...fishingActivities].sort((a, b) => {
            if(inversedSort) {
                return new Date(a.operationDateTime) - new Date(b.operationDateTime)
            } else {
                return new Date(b.operationDateTime) - new Date(a.operationDateTime)
            }
        })

        setAscendingSort(inversedSort)
        setFishingActivities(sortedFishingActivities)
    }

    const selectStyles = {
        container: (provided, state) => ({
            ...provided,
            padding: 0,
            height: 'fit-content',
            zIndex: 4
        }),
        control: base => ({ ...base, minHeight: 26, fontSize: 13, borderRadius: 'unset', borderColor: COLORS.grayDarker }),
        option: base => ({ ...base, fontSize: 13 }),
        menu: base => ({ ...base, margin: 0, padding: 0, maxHeight: 360 }),
        menuList: base => ({ ...base, maxHeight: 360 }),
        input: base => ({ padding: 0, margin: 0 }),
        clearIndicator: base => ({ ...base, padding: 1, width: 18 }),
        dropdownIndicator: base => ({ ...base, padding: 1, width: 18 }),
        valueContainer: base => ({ ...base, minWidth: 130, fontSize: 13, padding: '0px 2px' }),
        multiValue: base => ({ ...base, fontSize: 13, borderRadius: 12, background: COLORS.grayBackground }),
        multiValueLabel: base => ({ ...base, paddingTop: 2, paddingBottom: 1, background: COLORS.grayBackground, color: COLORS.textGray, borderRadius: 12}),
        multiValueRemove: base => ({ ...base, background: COLORS.grayBackground, color: COLORS.grayDarker, borderRadius: 12,
            "&:hover": {
                backgroundColor: COLORS.grayDarker,
                color: COLORS.grayDarkerTwo
            }}),
        placeholder: base => ({ ...base, fontSize: 13 }),
        singleValue: base => ({ ...base, fontSize: 13 }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    return <Wrapper>
        <Arrow onClick={() => props.showFishingActivitiesSummary()}/><Previous onClick={() => props.showFishingActivitiesSummary()}>Revenir au résumé</Previous>
        <Filters>
            <Select
              menuPortalTarget={document.body}
              placeholder="Filtrer les messages"
              closeMenuOnSelect={true}
              components={animatedComponents}
              defaultValue={selectedOptions}
              value={selectedOptions}
              onChange={setSelectedOptions}
              isMulti
              options={options}
              styles={selectStyles}
              isSearchable={false}
            />
            <InverseDate ascendingSort={ascendingSort} onClick={() => inverseSort()}/>
        </Filters>
        { fishingActivities && fishingActivities.length ?
            fishingActivities
                .filter(ersMessage => {
                    if (selectedOptions && selectedOptions.length) {
                        return selectedOptions.some(messageType => ersMessage.messageType === messageType.value)
                    } else {
                        return true
                    }
                })
                .map(message => {
                return <ERSMessage key={message.ersId} message={message}/>
            }) : <NoMessage>Aucun message reçu</NoMessage> }
    </Wrapper>
}

const InverseDate = styled(SortSVG)`
  border: 1px solid ${COLORS.grayDarker};
  width: 15px;
  height: 12px;
  padding: 6px;
  margin-left: auto;
  cursor: pointer;
  ${props => props.ascendingSort ? 'transform: rotate(180deg);' : null}
`

const Filters = styled.div`
  display: flex;
  margin-top: 10px;
`

const Arrow = styled(ArrowSVG)`
  vertical-align: sub;
  transform: rotate(180deg);
  margin-right: 5px
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 40px;
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
