import styled from 'styled-components'
import {Uploader} from "rsuite";

type UploadFilesProps = Readonly<{
  reportId: string
}>
export function UploadFiles({ reportId }: UploadFilesProps) {
  return (
    <Wrapper>
      <Uploader action={`/bff/v1/prior_notifications/${reportId}/upload`} draggable>
        <File>Glissez ou déposez des fichier à ajouter au préavis.</File>
      </Uploader>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`

const File = styled.div`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
  padding: 24px 90px;
`
