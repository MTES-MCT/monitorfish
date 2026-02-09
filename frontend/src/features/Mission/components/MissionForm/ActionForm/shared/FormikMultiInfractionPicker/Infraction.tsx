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

          <div>
            <IconButton
              accent={Accent.SECONDARY}
              Icon={Icon.Edit}
              onClick={() => onEdit(index)}
              style={{ marginRight: '8px' }}
              title="Éditer l'infraction"
            />
            <IconButton
              accent={Accent.SECONDARY}
              color={THEME.color.chineseRed}
              Icon={Icon.Delete}
              onClick={() => onDelete(index)}
              title="Supprimer l'infraction"
            />
          </div>
        </div>

        {data.comments?.trim().length > 0 && (
          <article>
            <ReactMarkdown>{data.comments}</ReactMarkdown>
          </article>
        )}
      </InnerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $hasError: boolean
}>`
  padding: 16px;

  > legend {
    padding: 12px 0 8px;

    &:first-child {
      padding: 0 0 8px;
    }
  }

  ${p =>
    p.$hasError &&
    css`
      border: 2px solid ${p.theme.color.maximumRed};
    `}
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
  > div {
    display: flex;
    justify-content: space-between;

    > div:last-child {
      align-items: flex-start;
      display: flex;
    }
  }

  > article {
    margin-top: 11px;
  }
`
