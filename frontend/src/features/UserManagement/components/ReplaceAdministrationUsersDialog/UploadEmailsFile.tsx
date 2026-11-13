import { Icon } from '@mtes-mct/monitor-ui'
import { Uploader } from 'rsuite'
import styled from 'styled-components'

import { getEmailsFromFile } from '../../utils'

import type { FileType } from 'rsuite/esm/Uploader/Uploader'

type UploadEmailsFileProps = Readonly<{
  onChange: (emails: string[]) => void
}>
export function UploadEmailsFile({ onChange }: UploadEmailsFileProps) {
  const onUpload = async (fileList: FileType[]) => {
    const file = fileList.at(-1)?.blobFile
    if (!file) {
      return
    }

    onChange(await getEmailsFromFile(file))
  }

  return (
    <StyledUploader
      accept=".csv,.xlsx,.xls"
      action=""
      autoUpload={false}
      draggable
      fileListVisible={false}
      multiple={false}
      onChange={fileList => {
        void onUpload(fileList)
      }}
    >
      <File>
        <Icon.Download size={16} />
        Importer un fichier CSV d’e-mails
      </File>
    </StyledUploader>
  )
}

const StyledUploader = styled(Uploader)`
  .rs-uploader-trigger-btn {
    border: 1px dashed ${p => p.theme.color.slateGray} !important;
    cursor: pointer;
    text-align: center;
  }
`
const File = styled.div`
  color: ${p => p.theme.color.charcoal};
  padding: 5px 0;

  .Element-IconBox {
    margin-right: 4px;
    vertical-align: bottom;
  }
`
