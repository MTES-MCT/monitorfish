import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { reportingIsAnInfractionSuspicion } from '../../../../domain/entities/reporting'
import { ReactComponent as ChevronIconSVG } from '../../../icons/Chevron_simple_gris.svg'
import Reporting from '../Reporting'

function YearReporting(props) {
  const {
    /** @type {Reporting[]} yearReportings */
    isLastItem,
    year,
    yearReportings,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [numberOfInfractionsSuspicion, setNumberOfInfractionsSuspicion] = useState(0)
  const numberOfObservations = yearReportings?.length - numberOfInfractionsSuspicion

  useEffect(() => {
    if (yearReportings?.length) {
      const nextNumberOfInfractionsSuspicion = parseFloat(
        yearReportings
          .reduce((accumulator, reporting) => accumulator + reportingIsAnInfractionSuspicion(reporting.type), 0)
          .toFixed(1),
      )

      setNumberOfInfractionsSuspicion(nextNumberOfInfractionsSuspicion)
    } else {
      setNumberOfInfractionsSuspicion(0)
    }
  }, [yearReportings])

  return (
    yearReportings && (
      <Row>
        <YearTitle
          data-cy="vessel-sidebar-reporting-tab-archive-year"
          isEmpty={yearReportings.length === 0}
          isLastItem={isLastItem}
          isOpen={isOpen}
        >
          <Text
            isEmpty={yearReportings.length === 0}
            isOpen={isOpen}
            onClick={() => yearReportings.length && setIsOpen(!isOpen)}
            title={year}
          >
            {yearReportings.length ? <ChevronIcon $isOpen={isOpen} /> : null}
            <Year>{year}</Year>
            <YearResume data-cy="vessel-reporting-year">
              {!yearReportings.length ? 'Pas de signalement' : null}
              {numberOfInfractionsSuspicion ? (
                <>
                  {numberOfInfractionsSuspicion} suspicion{numberOfInfractionsSuspicion > 1 ? 's' : ''}{' '}
                  d&apos;infraction{numberOfInfractionsSuspicion > 1 ? 's' : ''} <Red />
                </>
              ) : null}
              {numberOfObservations ? (
                <>
                  {numberOfObservations} observation{numberOfObservations > 1 ? 's' : ''} <Opal />
                </>
              ) : null}
            </YearResume>
          </Text>
        </YearTitle>
        <List isOpen={isOpen} name={year}>
          {yearReportings.length
            ? yearReportings
                .sort((a, b) => new Date(b.validationDate) - new Date(a.validationDate))
                .map(reporting => <Reporting key={reporting.id} isArchive reporting={reporting} />)
            : null}
        </List>
      </Row>
    )
  )
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  margin-right: 10px;
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const Opal = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: ${COLORS.opal};
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
  ${props => (props.isEmpty ? null : 'cursor: pointer;')}
  ${props => (!props.isOpen ? null : `border-bottom: 1px solid ${COLORS.gray};`)}
  ${props => (!props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null)}
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

  animation: ${props => (props.$isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing')} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes chevron-layer-closing {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(180deg);
    }
  }
`

const List = styled.div`
  height: ${props => (props.isOpen ? 'inherit' : '0px')};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  padding: ${props => (props.isOpen ? '10px 20px 0px 20px' : '0px')};
  overflow: hidden;
  transition: all 0.2s ease;
`

const Text = styled.div`
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  ${props => (props.isEmpty ? null : 'cursor: pointer;')}
`

export default YearReporting
