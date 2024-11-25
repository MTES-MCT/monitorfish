import { Logbook } from '@features/Logbook/Logbook.types'

import { Haul } from './Haul'

type FARMessageProps = {
  message: Logbook.FarMessageValue
}
export function FARMessage({ message }: FARMessageProps) {
  return (
    <>
      {message.hauls.map((haul, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Haul key={index} hasManyHauls={message.hauls.length > 1} haul={haul} haulNumber={index + 1} />
      ))}
    </>
  )
}
