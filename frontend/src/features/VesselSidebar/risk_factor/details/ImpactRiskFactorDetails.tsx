import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import InfoSVG from '../../../icons/Information.svg?react'
import { COLORS } from '../../../../constants/constants'
import { useSelector } from 'react-redux'

const ImpactRiskFactorDetails = ({ isOpen }) => {
  const { selectedVessel } = useSelector(state => state.vessel)
  const [faoZones, setFaoZones] = useState([])
  const speciesElement = useRef()

  const { riskFactor } = selectedVessel

  useEffect(() => {
    if (riskFactor && riskFactor.speciesOnboard) {
      const faoZones = riskFactor.speciesOnboard.map(species => {
        return species.faoZone
      })

      setFaoZones([...new Set(faoZones)])
    } else {
      setFaoZones([])
    }
  }, [riskFactor])

  return (
    <SubRiskDetails
      isOpen={isOpen}
      hasSegment={riskFactor?.segmentHighestImpact}
      speciesHeight={speciesElement?.current?.clientHeight}
    >
      <Line />
      <Zone>
        {riskFactor?.segmentHighestImpact ? (
          <>
            <Fields>
              <TableBody>
                <Field>
                  <Key big>Segment de flotte actuel</Key>
                  <Value>
                    {riskFactor?.segmentHighestImpact ? (
                      <>
                        {riskFactor?.segmentHighestImpact}{' '}
                        <Info
                          title={
                            'La note de risque de ce segment est la note attribuée par la DIRM de la ' +
                            'façade dans son Plan de contrôle annuel.'
                          }
                        />
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Engins à bord</Key>
                  <Value>
                    {riskFactor?.gearOnboard?.length ? (
                      riskFactor?.gearOnboard?.map(gear => gear.gear).join(', ')
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Espèces à bord</Key>
                  <Value
                    ref={speciesElement}
                    title={
                      riskFactor?.speciesOnboard?.length
                        ? riskFactor?.speciesOnboard?.map(gear => gear.species).join(', ')
                        : undefined
                    }
                  >
                    {riskFactor?.speciesOnboard?.length ? (
                      riskFactor?.speciesOnboard?.length > 20 ? (
                        `${riskFactor?.speciesOnboard
                          ?.map(gear => gear.species)
                          .join(', ')
                          .substring(0, 104)}...`
                      ) : (
                        riskFactor?.speciesOnboard?.map(gear => gear.species).join(', ')
                      )
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Zones de la marée</Key>
                  <Value>{faoZones.length ? faoZones.join(', ') : <NoValue>-</NoValue>}</Value>
                </Field>
              </TableBody>
            </Fields>
          </>
        ) : (
          <Text>
            Ce navire n&apos;appartient à aucun segment de flotte, soit parce qu&apos;il n&apos;a pas encore envoyé les
            données de sa marée, soit parce qu&apos;aucun segment ne correspond à son activité.
          </Text>
        )}
      </Zone>
    </SubRiskDetails>
  )
}

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${props => (props.$isInfoSegment ? '5px' : '2px')};
`

const SubRiskDetails = styled.div`
  width: 100%;
  z-index: ${props => props.speciesHeight};
  height: ${props =>
    props.isOpen
      ? props.hasSegment
        ? 120 + (props.speciesHeight ? (props.speciesHeight < 60 ? props.speciesHeight : 60) : 36)
        : 80
      : 0}px;
  opacity: ${props => (props.isOpen ? '1' : '0')};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 5px 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  padding: 10px 5px 5px 20px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: ${props => (props.big ? '160px' : '120px')};
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const Text = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
  margin-left: -15px;
  margin-top: 5px;
`

export default ImpactRiskFactorDetails
