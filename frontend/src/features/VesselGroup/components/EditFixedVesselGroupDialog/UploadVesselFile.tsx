import { getVesselsFromFile } from '@features/VesselGroup/components/EditFixedVesselGroupDialog/utils'
import { Icon } from '@mtes-mct/monitor-ui'
import { Uploader } from 'rsuite'
import styled from 'styled-components'

import type { VesselIdentityForVesselGroup } from '@features/VesselGroup/types'
import type { FileType } from 'rsuite/esm/Uploader/Uploader'

type UploadVesselFileProps = Readonly<{
  onChange: (vessels: VesselIdentityForVesselGroup[]) => void
}>
export function UploadVesselFile({ onChange }: UploadVesselFileProps) {
  const onUpload = async (fileList: FileType[]) => {
    const fileType = fileList[0]
    if (!fileType) {
      return
    }

    const vessels = await getVesselsFromFile(fileType.blobFile as File)
    onChange(vessels)
  }

  return (
    <Wrapper>
      <Uploader action="" autoUpload={false} draggable fileListVisible={false} onChange={onUpload}>
        <File>
          <Icon.Download size={16} />
          Ajouter une liste de navires
        </File>
      </Uploader>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 16px;

  .rs-uploader-trigger-btn {
    border: 1px dashed #3b4559 !important;
    cursor: pointer;
  }
`

const File = styled.div`
  color: ${p => p.theme.color.charcoal};
  padding: 5px 90px;

  .Element-IconBox {
    vertical-align: bottom;
    margin-right: 4px;
  }
`
