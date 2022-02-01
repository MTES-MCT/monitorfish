import React from 'react'
import { Label } from './RegulatoryMetadata.style'

const CodeAndName = ({ code, name }) => {
  return <Label>{`${code
      ? `${code} ${name ? `(${name})` : ''}`
      : `${name ? `${name}` : ''}`
    }`}</Label>
}

export default CodeAndName
