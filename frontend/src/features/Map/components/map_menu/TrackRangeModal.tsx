import { Button, DateRangePicker, Dialog, type DateRange } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type TrackRangeModalProps = {
  onChange: (dateRange?: DateRange | undefined) => void
  onClose: () => void
  selectedDates?: DateRange | undefined
}

export function TrackRangeModal({ onChange, onClose, selectedDates }: TrackRangeModalProps) {
  return (
    <Dialog>
      <Dialog.Title onClose={onClose}>Afficher la piste VMS sur une période précise</Dialog.Title>
      <StyledDialogBody>
        <DateRangePicker
          defaultValue={selectedDates}
          isHistorical
          isLabelHidden
          label="Période précise"
          name="customPeriod"
          onChange={onChange}
        />
      </StyledDialogBody>
      <Dialog.Action>
        <Button onClick={onClose}>Fermer</Button>
      </Dialog.Action>
    </Dialog>
  )
}

const StyledDialogBody = styled(Dialog.Body)`
  padding-bottom: 24px;
  overflow-y: inherit;
`
