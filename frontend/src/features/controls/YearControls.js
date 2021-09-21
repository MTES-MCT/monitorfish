import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import Control from './Control'
import { getNumberOfInfractions } from '../../domain/entities/controls'

const YearControls = props => {
  const {
    /** @type {VesselControl[]} yearControls */
    yearControls
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [numberOfInfractions, setNumberOfInfractions] = useState(null)

  useEffect(() => {
    if (yearControls && yearControls.length) {
      const nextNumberOfInfractions = parseFloat(yearControls
        .reduce((accumulator, control) => {
          return accumulator + getNumberOfInfractions(control)
        }, 0).toFixed(1))

      setNumberOfInfractions(nextNumberOfInfractions)
    }
  }, [yearControls])

  return yearControls &&
    <Row>
      <YearTitle isEmpty={yearControls.length === 0} isLastItem={props.isLastItem} isOpen={isOpen}>
        <Text isEmpty={yearControls.length === 0} isOpen={isOpen} title={props.year} onClick={() => setIsOpen(!isOpen)}>
          {
            yearControls.length ? <ChevronIcon isOpen={isOpen}/> : null
          }
          <Year>{props.year}</Year>
          <YearResume data-cy={'vessel-controls-year'}>
            {
              yearControls.length
                ? <>{yearControls.length} contrôle{yearControls.length > 1 ? 's' : ''}</>
                : 'Pas de contrôle'
            }
            {
              yearControls.length
                ? numberOfInfractions
                  ? <>, {numberOfInfractions} infraction{numberOfInfractions > 1 ? 's' : ''} <Red/></>
                  : <>, pas d&apos;infraction <Green/></>
                : null
            }
          </YearResume>
        </Text>
      </YearTitle>
      <List
        isOpen={isOpen}
        name={yearControls.length && yearControls[0] ? yearControls[0].controlDatetimeUtc : props.year}>
        {
          yearControls.length
            ? yearControls
              .sort((a, b) => new Date(b.controlDatetimeUtc) - new Date(a.controlDatetimeUtc))
              .map((control, index) => {
                return <Control
                  key={index}
                  isLastItem={yearControls.length === index + 1}
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
  background-color: ${COLORS.mediumSeaGreen};
  border-radius: 50%;
  display: inline-block;
`

const Year = styled.span`
  color: ${COLORS.slateGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${COLORS.gunMetal};
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
  color: ${COLORS.gunMetal};
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
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  ${props => props.isEmpty ? null : 'cursor: pointer;'} 
`

export default YearControls
