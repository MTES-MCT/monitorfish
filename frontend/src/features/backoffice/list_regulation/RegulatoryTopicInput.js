import React, { useState, useEffect, useRef } from 'react'
import { CustomInput } from '../../commonStyles/Input.style'

const RegulatoryTopicInput = props => {
  const {
    topic,
    updateTopic,
    setIsTopicEditable
  } = props

  const [value, setValue] = useState()
  const ref = useRef()

  const update = () => {
    if (value && value !== topic) {
      updateTopic(topic, value)
    }
    setIsTopicEditable(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      update()
    }
    if (event.key === 'Escape') {
      setValue(topic)
    }
  }

  useEffect(() => {
    ref.current.focus()
  }, [])

  useEffect(() => {
    setValue(topic)
  }, [topic])

  return (
    <CustomInput
      data-cy="regulatory-topic-edit-input"
      inputRef={ref}
      value={value}
      onChange={val => setValue(val)}
      onBlur={update}
      onKeyDown={handleKeyDown}
    />
  )
}

export default RegulatoryTopicInput
