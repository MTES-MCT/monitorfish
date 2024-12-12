import { useEffect, useState } from 'react'

import { CustomInput } from '../../../commonStyles/Input.style'

type RegulatoryTopicInputProps = Readonly<{
  setIsTopicEditable: (isEditable: boolean) => void
  topic: string
  updateTopic: ((previousTopic: string, nextTopic: string) => void) | undefined
}>
export function RegulatoryTopicInput({ setIsTopicEditable, topic, updateTopic }: RegulatoryTopicInputProps) {
  const [value, setValue] = useState<string | undefined>()

  const update = () => {
    if (updateTopic && value && value !== topic) {
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
