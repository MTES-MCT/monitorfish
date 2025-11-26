import { MissionAction } from '@features/Mission/missionAction.types'
import { Accent, Icon, IconButton, Legend, Tag, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type InfractionProps = Readonly<{
  data: MissionAction.Infraction & { label: string | undefined }
  index: number
  onDelete: (index: number) => Promisable<void>
  onEdit: (index: number) => Promisable<void>
}>
export function Infraction({ data, index, onDelete, onEdit }: InfractionProps) {
  return (
    <>
      <Legend>Infraction {index + 1}</Legend>

      <InnerWrapper>
        <div>
          <TagGroup>
            <Tag accent={Accent.PRIMARY}>{MissionAction.INFRACTION_TYPE_LABEL[data.infractionType]}</Tag>
            {data.infractionType !== MissionAction.InfractionType.PENDING && (
              <StyledTag accent={Accent.PRIMARY} title={data.label ?? String(data.natinf)}>
                NATINF : {data.label ?? data.natinf}
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
    </>
  )
}

const StyledTag = styled(Tag)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
  display: inline-block;
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
