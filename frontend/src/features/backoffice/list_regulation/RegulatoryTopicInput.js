import React, { useEffect, useState } from 'react'

import { CustomInput } from '../../commonStyles/Input.style'

function RegulatoryTopicInput(props) {
  const { setIsTopicEditable, topic, updateTopic } = props

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
      data-cy="regulatory-topic-edit-input"
      disabled={false}
      onChange={val => setValue(val)}
      onKeyDown={handleKeyDown}
      value={value}
    />
  )
}

export default RegulatoryTopicInput
