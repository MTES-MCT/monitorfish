import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import Control from './Control'

const YearControls = props => {
  const [isOpen, setIsOpen] = useState(false)
  const [numberOfInfractions, setNumberOfInfractions] = useState(null)

  useEffect(() => {
    if (props.yearControls && props.yearControls.length) {
      const nextNumberOfInfractions = parseFloat(props.yearControls
        .reduce((accumulator, control) => {
          return accumulator + control.infractions.length
        }, 0).toFixed(1))

      setNumberOfInfractions(nextNumberOfInfractions)
    }
  }, [props.yearControls])

  return props.yearControls &&
    <Row>
        <YearTitle isEmpty={props.yearControls.length === 0} isLastItem={props.isLastItem} isOpen={isOpen}>
            <Text isEmpty={props.yearControls.length === 0} isOpen={isOpen} title={props.year} onClick={() => setIsOpen(!isOpen)}>
                {
                    props.yearControls.length ? <ChevronIcon isOpen={isOpen}/> : null
                }
                <Year>{props.year}</Year>
                <YearResume>
                    {
                      props.yearControls.length
                        ? <>{ props.yearControls.length } contrôle{ props.yearControls.length > 1 ? 's' : ''}</>
                        : 'Pas de contrôle'
                    }
                    {
                      props.yearControls.length
                        ? numberOfInfractions
                          ? <>, {numberOfInfractions} infractions <Red/></>
                          : <>, pas d&apos;infraction <Green /></>
                        : null
                    }
                </YearResume>
            </Text>
        </YearTitle>
        <List
          isOpen={isOpen}
          name={props.yearControls.length && props.yearControls[0] ? props.yearControls[0].controlDatetimeUtc : props.year}>
            {
                props.yearControls.length
                  ? props.yearControls.map((control, index) => {
                    return <Control
                        key={index}
                        isLastItem={props.yearControls.length === index + 1}
                        control={control}/>
                  })
                  : null
            }
        </List>
    </Row>
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const Green = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #8CC63F;
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${COLORS.textGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const YearTitle = styled.span`
  padding: 7px 5px 5px 20px;
  width: 100%;
  display: flex;
  user-select: none;
  ${props => props.isEmpty ? null : 'cursor: pointer;'} 
  ${props => !props.isOpen ? null : `border-bottom: 1px solid ${COLORS.gray};`}
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const Row = styled.div`
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  background: ${COLORS.background};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 10px;
  margin-top: 9px;
  float: right;
  
  animation: ${props => props.isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

const List = styled.div`
  height: 0;
  overflow: hidden;
  opacity: 0;
  animation: ${props => props.isOpen ? 'list-controls-opening' : 'list-controls-closing'} 0.2s ease forwards;

  @keyframes list-controls-opening {
    0%   { opacity: 0; height: 0; }
    100% { opacity: 1; height: inherit; }
  }

  @keyframes list-controls-closing {
    0%   { opacity: 1; height: inherit; }
    100% { opacity: 0; height: 0; }
  }
`

const Text = styled.div`
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  ${props => props.isEmpty ? null : 'cursor: pointer;'} 
`

export default YearControls
