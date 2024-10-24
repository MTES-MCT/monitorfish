import { IconButton, type IconButtonProps } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export type BackOfficeIconLinkProps = Omit<IconButtonProps, 'onClick'> & {
  to: string
}
export function BackOfficeIconLink({ to, ...originalProps }: BackOfficeIconLinkProps) {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    navigate(to)
  }, [navigate, to])

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IconButton onClick={handleClick} {...originalProps} />
}
