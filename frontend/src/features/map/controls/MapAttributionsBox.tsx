import { useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

export function MapAttributionsBox() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Wrapper className="ol-unselectable ol-control">
      <List className={isVisible ? '' : 'collapsed'}>
        <ListItem>
          <Link data-bcup-haslogintext="no" href="https://www.openstreetmap.org/copyright" target="_blank">
            © OpenStreetMap contributors
          </Link>
        </ListItem>
      </List>
      <Button data-bcup-haslogintext="no" onClick={() => setIsVisible(!isVisible)} title="Attributions" type="button">
        ©
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  bottom: 10px;
  left: 0.5em;
  max-width: calc(100% - 1.3em);
  background: none;
`

const Button = styled.button`
  line-height: 22px !important;
  width: 25px !important;
  height: 25px !important;

  &:hover {
    background: none;
  }
`

const List = styled.ul`
  font-size: 0.9em;
  background-color: ${COLORS.charcoal};
  height: 21px;
  line-height: 1;
  border: none;
  border-radius: 0;
  margin: 2px 2px 2px 34px;
  padding: 4px 6px 0px 6px;
`

const ListItem = styled.li`
  font-size: 13px;
  list-style-type: none;
  margin: 0;
`

const Link = styled.a`
  color: ${COLORS.lightGray};

  &:active,
  &:hover,
  &:visited {
    color: ${COLORS.lightGray};
  }
`
