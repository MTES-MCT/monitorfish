import { Haul } from './Haul'

// TODO Type this `any`.
type FARMessageProps = {
  message: {
    hauls: any[]
  }
}
export function FARMessage({ message }: FARMessageProps) {
  const { hauls } = message

  return (
    <>
      {hauls.map((haul, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Haul key={index} hasManyHauls={hauls?.length > 1} haul={haul} haulNumber={index + 1} />
      ))}
    </>
  )
}
