import {
  VESSEL_LIST_EXPORT_CHECKBOX_OPTIONS,
  VESSEL_LIST_CSV_FORMAT_AS_OPTIONS,
  VesselListCsvExportFormat,
  DEFAULT_CHECKBOXES_FIRST_COLUMN,
  DEFAULT_CHECKBOXES_THIRD_COLUMN,
  DEFAULT_CHECKBOXES_SECOND_COLUMN,
  SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_FIRST_COLUMN,
  SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_SECOND_COLUMN,
  SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_THIRD_COLUMN
} from '@features/Vessel/components/ExportVesselListDialog/constants'
import { downloadVesselList } from '@features/Vessel/useCases/downloadVesselList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useTracking } from '@hooks/useTracking'
import { Accent, Button, Dialog, MultiCheckbox, MultiRadio } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type ExportActivityReportsDialogProps = {
  onExit: () => Promisable<void>
  selectedRows: Record<string, boolean>
}
export function ExportVesselListDialog({ onExit, selectedRows }: ExportActivityReportsDialogProps) {
  const dispatch = useMainAppDispatch()
  const [firstColumnsCsv, setFirstColumnsCsv] = useState(DEFAULT_CHECKBOXES_FIRST_COLUMN)
  const [secondColumnsCsv, setSecondColumnsCsv] = useState<string[]>([])
  const [thirdColumnsCsv, setThirdColumnsCsv] = useState(DEFAULT_CHECKBOXES_THIRD_COLUMN)
  const [format, setFormat] = useState(VesselListCsvExportFormat.VMS_SITUATION)
  const { trackEvent } = useTracking()

  const handleOnDownload = async () => {
    const allColumns = firstColumnsCsv.concat(secondColumnsCsv, thirdColumnsCsv)
    await dispatch(downloadVesselList(allColumns, selectedRows, format))
    trackEvent({
      action: 'Téléchargement de la liste des navires',
      category: 'DOWNLOAD',
      name: ''
    })

    onExit()
  }

  const handleOnChangeFormat = (nextFormat: VesselListCsvExportFormat) => {
    switch (nextFormat) {
      case VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS: {
        setFirstColumnsCsv(SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_FIRST_COLUMN)
        setSecondColumnsCsv(SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_SECOND_COLUMN)
        setThirdColumnsCsv(SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_THIRD_COLUMN)
        break
      }
      case VesselListCsvExportFormat.VMS_SITUATION: {
        setFirstColumnsCsv(DEFAULT_CHECKBOXES_FIRST_COLUMN)
        setSecondColumnsCsv(DEFAULT_CHECKBOXES_SECOND_COLUMN)
        setThirdColumnsCsv(DEFAULT_CHECKBOXES_THIRD_COLUMN)
        break
      }
      default:
    }

    setFormat(nextFormat)
  }

  return (
    <StyledDialog isAbsolute>
      <StyledDialogTitle>Télécharger la liste des navires</StyledDialogTitle>
      <StyledDialogBody>
        <MultiRadio
          isInline
          isLabelHidden
          label="Format du CSV"
          name="vessel-list-csv-format"
          onChange={nextValue => handleOnChangeFormat(nextValue as VesselListCsvExportFormat)}
          options={VESSEL_LIST_CSV_FORMAT_AS_OPTIONS}
          value={format}
        />
        <hr />
        <Columns>
          <StyledMultiCheckbox
            $width={230}
            isLabelHidden
            label="Colonnes (1)"
            name="csv_columns_first"
            onChange={nextValues => setFirstColumnsCsv(nextValues as string[])}
            options={VESSEL_LIST_EXPORT_CHECKBOX_OPTIONS.slice(0, 7)}
            readOnly={format === VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS}
            value={firstColumnsCsv}
          />
          <StyledMultiCheckbox
            $width={230}
            isLabelHidden
            label="Colonnes (2)"
            name="csv_columns_second"
            onChange={nextValues => setSecondColumnsCsv(nextValues as string[])}
            options={VESSEL_LIST_EXPORT_CHECKBOX_OPTIONS.slice(7, 12)}
            readOnly={format === VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS}
            value={secondColumnsCsv}
          />
          <StyledMultiCheckbox
            $width={180}
            isLabelHidden
            label="Colonnes (3)"
            name="csv_columns_third"
            onChange={nextValues => setThirdColumnsCsv(nextValues as string[])}
            options={VESSEL_LIST_EXPORT_CHECKBOX_OPTIONS.slice(12, 18)}
            readOnly={format === VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS}
            value={thirdColumnsCsv}
          />
        </Columns>
      </StyledDialogBody>
      <StyledDialogAction>
        <Button accent={Accent.PRIMARY} onClick={handleOnDownload}>
          Télécharger le tableau
        </Button>
        <Button accent={Accent.TERTIARY} onClick={onExit}>
          Annuler
        </Button>
      </StyledDialogAction>
    </StyledDialog>
  )
}

const Columns = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledDialog = styled(Dialog)`
  > div:last-child {
    min-width: 800px;
    max-width: 800px;
  }
`

const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`

const StyledMultiCheckbox = styled(MultiCheckbox)<{
  $width: number
}>`
  width: ${p => p.$width}px;

  .Field-Checkbox {
    margin-bottom: 12px !important;
  }
`

const StyledDialogAction = styled(Dialog.Action)`
  padding: 24px 8px;
`

const StyledDialogBody = styled(Dialog.Body)`
  padding: 45px 80px;
`
