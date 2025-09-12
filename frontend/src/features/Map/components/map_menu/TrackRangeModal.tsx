import { Button, DateRangePicker, Dialog, type DateRange } from '@mtes-mct/monitor-ui'

type TrackRangeModalProps = {
  onChange: (dateRange?: DateRange | undefined) => void
  onClose: () => void
  selectedDates?: DateRange | undefined
}

export function TrackRangeModal({ onChange, onClose, selectedDates }: TrackRangeModalProps) {
  return (
    <Dialog>
      <Dialog.Title>Afficher la piste VMS sur une période précise</Dialog.Title>
      <Dialog.Body>
        <DateRangePicker
          defaultValue={selectedDates}
          isHistorical
          isLabelHidden
          label="période précise"
          name="customPeriod"
          onChange={onChange}
        />
      </Dialog.Body>
      <Dialog.Action>
        <Button onClick={onClose}>Fermer</Button>
      </Dialog.Action>
    </Dialog>
  )
}
