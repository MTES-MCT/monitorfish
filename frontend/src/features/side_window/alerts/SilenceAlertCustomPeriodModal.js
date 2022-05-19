import React from 'react'
import styled from 'styled-components'
import Modal from 'rsuite/lib/Modal'
import DateRange from '../../vessel_sidebar/actions/track_request/DateRange'
import { COLORS } from '../../../constants/constants'

const SilenceAlertCustomPeriodModal = ({ isModalOpen, setModalIsOpen, selectedDates, setSelectedDates, containerRef }) => {
  return (
    <CustomModal
      style={modalStyle(isModalOpen)}
    >
      <Modal.Header
        closeButton={false}
      >
        <Modal.Title>
          <Title>
            Période précise
          </Title>
        </Modal.Title>
      </Modal.Header>
      <Body style={bodyStyle}>
        <DateRange
          containerRef={containerRef?.current}
          placeholder={'Période précise'}
          dates={selectedDates}
          resetToDefaultTrackDepth={() => setModalIsOpen(false)}
          modifyVesselTrackFromDates={setSelectedDates}
          width={145}
        />
      </Body>
    </CustomModal>
  )
}

const CustomModal = styled.div``
const modalStyle = isModalOpen => ({
  top: 0,
  position: isModalOpen ? 'absolute' : 'unset',
  display: isModalOpen ? 'block' : 'none',
  background: COLORS.background,
  width: 220,
  boxShadow: `1px 2px 5px ${COLORS.overlayShadowDarker}`
})

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
  color: ${COLORS.gainsboro};
`

const Body = styled.div``
const bodyStyle = {
  padding: '5px 0px 0px',
  textAlign: 'center',
  height: 60,
  minHeight: 60
}

export default SilenceAlertCustomPeriodModal
