import { Accent, Icon, IconButton, Legend, Tag, TagBullet, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { MissionAction } from '../../../../../../domain/types/missionAction'

import type { Promisable } from 'type-fest'

export type InfractionProps<AnyInfraction extends MissionAction.OtherInfraction> = {
  data: AnyInfraction
  index: number
  onDelete: (index: number) => Promisable<void>
  onEdit: (index: number) => Promisable<void>
  seizurePropName: keyof AnyInfraction | undefined
  seizureTagLabel: string | undefined
}
export function Infraction<AnyInfraction extends MissionAction.OtherInfraction>({
  data,
  index,
  onDelete,
  onEdit,
  seizurePropName,
  seizureTagLabel
}: InfractionProps<AnyInfraction>) {
  return (
    <>
      <Legend>Infraction obligations déclaratives et autorisations {index + 1}</Legend>

      <InnerWrapper>
        <div>
          <TagGroup>
            {seizurePropName && seizureTagLabel && data[seizurePropName] && (
              <Tag accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
                {seizureTagLabel}
              </Tag>
            )}
            <Tag accent={Accent.PRIMARY}>{MissionAction.INFRACTION_TYPE_LABEL[data.infractionType]}</Tag>
            <Tag accent={Accent.PRIMARY}>NATINF : {data.natinf}</Tag>
          </TagGroup>

          <div>
            <IconButton
              accent={Accent.SECONDARY}
              Icon={Icon.Edit}
              onClick={() => onEdit(index)}
              style={{ marginRight: '8px' }}
            />
            <IconButton
              accent={Accent.SECONDARY}
              color={THEME.color.chineseRed}
              Icon={Icon.Delete}
              onClick={() => onDelete(index)}
            />
          </div>
        </div>

        {data.comments.trim().length > 0 && (
          <article>
            <ReactMarkdown>{data.comments}</ReactMarkdown>
          </article>
        )}
      </InnerWrapper>
    </>
  )
}

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
