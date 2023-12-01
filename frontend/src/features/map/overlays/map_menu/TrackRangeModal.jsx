import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Modal } from 'rsuite'
import { DateRange } from '../../../VesselSidebar/actions/TrackRequest/DateRange'
import StyledModalHeader from '../../../commonComponents/StyledModalHeader'

/**
 * @typedef {object} TrackRangeModalProps
 * @property {boolean} isOpen
 * @property {(dateRange?: [Date, Date]) => void} onChange
 * @property {() => void} onClose
 * @property {[Date, Date]=} selectedDates
 */

/**
 * @param {TrackRangeModalProps} props
 */
export const TrackRangeModal = ({ isOpen, onChange, onClose, selectedDates }) => {
  return (
    <ModalWithCustomHeight
      backdrop
      onClose={onClose}
      open={isOpen}
      size={'xs'}
      style={{ marginTop: 100 }}
    >
      <StyledModalHeader>
        <Modal.Title>
          <Title>
            Afficher la piste VMS sur une période précise
          </Title>
        </Modal.Title>
      </StyledModalHeader>
      <Body>
        <DateRange
          defaultValue={selectedDates}
          isDisabledAfterToday
          onChange={onChange}
          placeholder={'Choisir une période précise'}
          width={265}
        />
      </Body>
    </ModalWithCustomHeight>
  )
}

const Title = styled.div`
  color: ${COLORS.gainsboro};
  font-size: 16px;
  line-height: 30px;
`

const Body = styled(Modal.Body)`
  padding: 20px 25px 0 25px !important;
  text-align: center;
`

const ModalWithCustomHeight = styled(Modal)`
  .rs-modal-content {
    height: 150px !important;
  }
`
