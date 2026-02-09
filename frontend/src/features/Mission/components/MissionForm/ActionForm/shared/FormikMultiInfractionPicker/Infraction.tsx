import { getFlatInfractionFromThreatsHierarchy } from '@features/Mission/components/MissionForm/ActionForm/utils'
import { useGetNatinfsAsOptions } from '@features/Mission/components/MissionForm/hooks/useGetNatinfsAsOptions'
import { MissionAction } from '@features/Mission/missionAction.types'
import { Accent, Icon, IconButton, Legend, Tag, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import ReactMarkdown from 'react-markdown'
import styled, { css } from 'styled-components'

import { getInfractionTitle } from '../../../../../../../domain/entities/controls'

import type { Promisable } from 'type-fest'

type InfractionProps = Readonly<{
  data: MissionAction.Infraction
  hasError: boolean
  hasMultipleInfraction?: boolean
  index: number
  onDelete: (index: number) => Promisable<void>
  onEdit: (index: number) => Promisable<void>
}>
export function Infraction({ data, hasError, hasMultipleInfraction, index, onDelete, onEdit }: InfractionProps) {
  const natinfsAsOptions = useGetNatinfsAsOptions()
  const natinfAndThreatCharacterization = getFlatInfractionFromThreatsHierarchy(data, natinfsAsOptions)

  return (
    <Wrapper $hasError={hasError}>
      <FirstColumn>
        <Legend>
          Infraction {hasMultipleInfraction && index + 1} -{' '}
          <ThreatCharacterization>{natinfAndThreatCharacterization.threat}</ThreatCharacterization>
        </Legend>

        <InnerWrapper>
          <div>
            <TagGroup>
              <Tag accent={Accent.PRIMARY}>{MissionAction.INFRACTION_TYPE_LABEL[data.infractionType]}</Tag>
              {data.infractionType !== MissionAction.InfractionType.PENDING && (
                <StyledTag accent={Accent.PRIMARY} title={getInfractionTitle(natinfAndThreatCharacterization)}>
                  {natinfAndThreatCharacterization.threatCharacterization} / NATINF{' '}
                  {natinfAndThreatCharacterization.natinf}
                </StyledTag>
              )}
            </TagGroup>
          </div>

          {data.comments?.trim().length > 0 && (
            <article>
              <ReactMarkdown>{data.comments}</ReactMarkdown>
            </article>
          )}
        </InnerWrapper>
      </FirstColumn>
      <SecondColumn>
        <IconButton
          accent={Accent.SECONDARY}
          Icon={Icon.Edit}
          onClick={() => onEdit(index)}
          style={{ marginRight: '8px' }}
          title="Éditer l'infraction"
        />
        <IconButton
          accent={Accent.SECONDARY}
          color={THEME.color.maximumRed}
          Icon={Icon.Delete}
          onClick={() => onDelete(index)}
          title="Supprimer l'infraction"
        />
      </SecondColumn>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $hasError: boolean
}>`
  display: flex;
  ${p =>
    p.$hasError &&
    css`
      border: 2px solid ${p.theme.color.maximumRed};
    `}
`

const FirstColumn = styled.div``

const SecondColumn = styled.div`
  margin-left: auto;
  align-items: flex-start;
  display: flex;
`

const StyledTag = styled(Tag)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
  display: inline-block;
`

const ThreatCharacterization = styled.span`
  color: ${p => p.theme.color.gunMetal};
`

const InnerWrapper = styled.div`
  margin-top: 6px;
  > div {
    display: flex;
    justify-content: space-between;
  }

  > article {
    margin-top: 11px;
  }
`
