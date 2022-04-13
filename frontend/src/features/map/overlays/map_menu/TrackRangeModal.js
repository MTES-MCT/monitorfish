import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import Modal from 'rsuite/lib/Modal'
import DateRange from '../../../vessel_sidebar/actions/track_request/DateRange'

const TrackRangeModal = ({ isModalOpen, setModalIsOpen, selectedDates, resetToDefaultTrackDepth, setSelectedDates }) => {
  return (
    <ModalWithCustomHeight
      size={'xs'}
      backdrop
      show={isModalOpen}
      style={{ marginTop: 100 }}
      onHide={() => setModalIsOpen(false)}
    >
      <Modal.Header>
        <Modal.Title>
          <Title>
            Afficher la piste VMS sur une période précise
          </Title>
        </Modal.Title>
      </Modal.Header>
      <Body>
        <DateRange
          dates={selectedDates}
          resetToDefaultTrackDepth={resetToDefaultTrackDepth}
          modifyVesselTrackFromDates={setSelectedDates}
          width={265}
        />
      </Body>
    </ModalWithCustomHeight>
  )
}

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
  color: ${COLORS.gainsboro};
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

export default TrackRangeModal
