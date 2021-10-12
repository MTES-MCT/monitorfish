import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import Modal from 'rsuite/lib/Modal'
import TrackDepthDateRange from '../../../vessel_sidebar/track_depth_selection/TrackDepthDateRange'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'

const CustomTrackDepthModal = ({ isModalOpen, setModalIsOpen, datesSelection, setDateSelection }) => {
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
        <TrackDepthDateRange
          dates={datesSelection}
          setDate={setDateSelection}
          width={265}
        />
        <Validate>Valider la période</Validate>
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

const Validate = styled(PrimaryButton)`
  margin-left: 0;
  margin-top: 10px;
`

const ModalWithCustomHeight = styled(Modal)`
  .rs-modal-content {
    height: 200px !important;
  }
`

export default CustomTrackDepthModal
