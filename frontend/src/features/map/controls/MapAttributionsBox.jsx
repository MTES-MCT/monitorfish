import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const MapAttributionsBox = () => {
  const [isVisible, setIsVisible] = useState(false)

  return (<Wrapper className={'ol-unselectable ol-control'}>
    <List className={isVisible ? '' : 'collapsed'}>
      <ListItem><Link href="https://www.openstreetmap.org/copyright" target="_blank" data-bcup-haslogintext="no">©
        OpenStreetMap contributors</Link></ListItem>
    </List>
    <Button onClick={() => setIsVisible(!isVisible)} type="button" title="Attributions" data-bcup-haslogintext="no">
      <ButtonText>
        ©
      </ButtonText>
    </Button>
  </Wrapper>)
}

const Wrapper = styled.div`
  bottom: 10px;
  left: .5em;
  max-width: calc(100% - 1.3em);
  background: none;
`

const Button = styled.button`
  float: left;
  width: 25px !important;
  height: 25px !important;

  :hover {
    background: none;
  }
`

const ButtonText = styled.span`
  font-size: 16px;
`

const List = styled.ul`
  font-size: 0.9em;
  background-color: ${COLORS.charcoal};
  height: 1.5em;
  border: none;
  border-radius: 0;
  margin: 2px;
  padding: 4px 5px 0px 5px;
`

const ListItem = styled.li`
  font-size: 13px;
  list-style-type: none;
  margin: 0;
`

const Link = styled.a`
  color: ${COLORS.lightGray};
`

export default MapAttributionsBox
