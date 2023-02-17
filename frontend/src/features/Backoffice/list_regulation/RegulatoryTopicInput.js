import React, { useEffect, useState } from 'react'
import { CustomInput } from '../../commonStyles/Input.style'

const RegulatoryTopicInput = props => {
  const {
    topic,
    updateTopic,
    setIsTopicEditable
  } = props

  const [value, setValue] = useState()

  const update = () => {
    if (value && value !== topic) {
      updateTopic(topic, value)
    }
    setIsTopicEditable(false)
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      update()
    }
    if (event.key === 'Escape') {
      setValue(topic)
    }
  }

  useEffect(() => {
    setValue(topic)
  }, [topic])

  return (
    <CustomInput
      disabled={false}
      data-cy="regulatory-topic-edit-input"
      value={value}
      onChange={val => setValue(val)}
      onKeyDown={handleKeyDown}
    />
  )
}

export default RegulatoryTopicInput
