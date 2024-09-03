import { monitorfishApiKy } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import {
  priorNotificationApi,
  useGetPriorNotificationUploadsQuery
} from '@features/PriorNotification/priorNotificationApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useKey } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { downloadFile } from '@utils/downloadFile'
import { useAuthRequestHeaders } from 'auth/hooks/useAuthRequestHeaders'
import { useCallback, useMemo } from 'react'
import { Uploader } from 'rsuite'
import styled from 'styled-components'

import type { FileType } from 'rsuite/esm/Uploader'

type UploadFilesProps = Readonly<{
  isManualPriorNotification: boolean
  operationDate: string
  reportId: string
}>
export function UploadFiles({ isManualPriorNotification, operationDate, reportId }: UploadFilesProps) {
  const dispatch = useMainAppDispatch()
  const headers = useAuthRequestHeaders()

  const action = `/bff/v1/prior_notifications/${reportId}/uploads?isManualPriorNotification=${isManualPriorNotification}&operationDate=${operationDate}`
  const { data: uploads } = useGetPriorNotificationUploadsQuery(reportId)

  const key = useKey([uploads])
  const uploadAsFileTypes: FileType[] | undefined = useMemo(
    () =>
      uploads
        ? uploads.map(upload => ({
            fileKey: upload.id,
            mimeType: upload.mimeType,
            name: upload.fileName
          }))
        : undefined,
    [uploads]
  )

  const download = useCallback(
    async (fileType: FileType) => {
      assertNotNullish(fileType.fileKey)
      assertNotNullish(fileType.name)

      const url = `/bff/v1/prior_notifications/${reportId}/uploads/${fileType.fileKey}`
      const response = await monitorfishApiKy.get(url)
      const blob = await response.blob()

      downloadFile(fileType.name, (fileType as any).mimeType, blob)
    },
    [reportId]
  )

  const refetch = useCallback(() => {
    dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotificationDocuments]))
  }, [dispatch])

  const remove = useCallback(
    async (file: FileType) => {
      assertNotNullish(file.fileKey)

      await dispatch(
        priorNotificationApi.endpoints.deletePriorNotificationUpload.initiate({
          isManualPriorNotification,
          operationDate,
          priorNotificationUploadId: String(file.fileKey),
          reportId
        })
      ).unwrap()
    },
    [dispatch, isManualPriorNotification, operationDate, reportId]
  )

  if (!headers || !uploadAsFileTypes) {
    return <></>
  }

  return (
    <Wrapper>
      <Uploader
        key={key}
        action={action}
        defaultFileList={uploadAsFileTypes}
        draggable
        headers={headers}
        onPreview={download}
        onRemove={remove}
        onSuccess={refetch}
      >
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

  > .rs-uploader {
    > .rs-uploader-file-items {
      > .rs-uploader-file-item {
        > .rs-uploader-file-item-panel {
          cursor: pointer;
        }
      }
    }
  }
`

const File = styled.div`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
  padding: 24px 90px;
`
