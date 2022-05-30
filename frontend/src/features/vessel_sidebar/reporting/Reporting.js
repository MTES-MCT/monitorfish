import React from 'react'
import styled from 'styled-components'
import { reportingIsAnInfractionSuspicion, reportingType } from '../../../domain/entities/reporting'
import { COLORS } from '../../../constants/constants'
import { getDateTime } from '../../../utils'

import { ReactComponent as ObservationIconSVG } from '../../icons/Icone_observations.svg'
import { ReactComponent as InfractionSuspicionIconSVG } from '../../icons/Icone_alerte_signalement_rouge_16.svg'
import { ReactComponent as ArchiveIconSVG } from '../../icons/Bouton_archiver.svg'
import { ReactComponent as EditIconSVG } from '../../icons/Bouton_editer.svg'
import { ReactComponent as DeleteIconSVG } from '../../icons/Bouton_supprimer.svg'
import { getAlertNameFromType } from '../../../domain/entities/alerts'

const Reporting = props => {
  const {
    /** @type Reporting */
    reporting
  } = props
  const isAnInfractionSuspicion = reportingIsAnInfractionSuspicion(reporting.type)
  const reportingName = Object.values(reportingType)
    .find(reportingType => reportingType.code === reporting?.type)?.name

  console.log(reporting)
  return <Wrapper isInfractionSuspicion={isAnInfractionSuspicion}>
    <Icon>
      {
        isAnInfractionSuspicion
          ? <InfractionSuspicionIcon/>
          : <ObservationIcon/>
      }
    </Icon>
    <Body isInfractionSuspicion={isAnInfractionSuspicion}>
      <Title>
        {reportingName}
        {' '}/{' '}
        {
          reporting?.type === reportingType.ALERT.code
            ? getAlertNameFromType(reporting?.value?.type)
            : null
        }
      </Title>
      <Date>
        Le {getDateTime(reporting?.validationDate, true)}
      </Date>
    </Body>
    <Actions isInfractionSuspicion={isAnInfractionSuspicion}>
      {
        reporting?.type === reportingType.OBSERVATION.code
          ? <EditButton
            title={'Editer'}
          />
          : null
      }
      <ArchiveButton
        title={'Archiver'}
      />
      <DeleteButton
        title={'Supprimer'}
      />
    </Actions>
  </Wrapper>
}

const Wrapper = styled.div`
  margin-bottom: 10px;
  display: flex;
  background: ${props => props.isInfractionSuspicion ? '#E1000F1A' : COLORS.cultured} 0% 0% no-repeat padding-box;
  border: 1px solid ${props => props.isInfractionSuspicion ? '#E1000F59' : COLORS.lightGray};
`

const Icon = styled.div`
  width: 45px;
`

const Body = styled.div`
  width: 365px;
  margin-top: 12px;
  margin-bottom: 12px;
  color: ${props => props.isInfractionSuspicion ? COLORS.maximumRed : COLORS.gunMetal};
`

const Actions = styled.div`
  padding-top: 3px;
  width: 30px;
  text-align: center;
  border-left: 1px solid ${props => props.isInfractionSuspicion ? '#E1000F59' : COLORS.lightGray};
`

const Title = styled.div`
  font: normal normal bold 13px/18px Marianne;
`

const Date = styled.span`
  font: normal normal normal 11px/15px Marianne;
`

const ObservationIcon = styled(ObservationIconSVG)`
  width: 25px;
  margin-top: 13px;
  margin-left: 10px;
`

const InfractionSuspicionIcon = styled(InfractionSuspicionIconSVG)`
  width: 20px;
  margin-top: 12px;
  margin-left: 12px;
`

const ArchiveButton = styled(ArchiveIconSVG)`
  cursor: pointer;
  margin-top: 7px;
`

const EditButton = styled(EditIconSVG)`
  cursor: pointer;
  margin-top: 7px;
`

const DeleteButton = styled(DeleteIconSVG)`
  cursor: pointer;
  margin-top: 7px;
  margin-bottom: 10px;
`

export default Reporting
