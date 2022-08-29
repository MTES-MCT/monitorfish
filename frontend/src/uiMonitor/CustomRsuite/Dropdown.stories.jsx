import React from 'react';
import styled from 'styled-components';
import { Dropdown } from 'rsuite';


import { ReactComponent as PlusSVG } from '../icons/plus.svg'
import { ReactComponent as ControlSVG } from '../icons/controles.svg'
import { ReactComponent as SurveillanceSVG } from '../icons/surveillance_18px.svg'
import { ReactComponent as NoteSVG } from '../icons/note_libre.svg'


export default {
  title: 'RsuiteMonitor/Dropdown'
};

const CustDropDown = ({size='sm', handleClick})=> {
  return <Dropdown appearance='primary' size={size} title={'Ajouter'} noCaret icon={<PlusSVG/>}>
        <Dropdown.Item icon={<ControlSVGIcon/>} onClick={handleClick}>
          Ajouter des contrôles
        </Dropdown.Item>
        <Dropdown.Item icon={<SurveillanceSVGIcon/>} onClick={handleClick}>
          Ajouter une surveillance
        </Dropdown.Item>
        <Dropdown.Item icon={<NoteSVGIcon/>} onClick={handleClick}>
          Ajouter une note libre
        </Dropdown.Item>
      </Dropdown>
}
const TemplateDropdown = () => {
  const handleClick = (e) => {
    console.log(e)
  }

  return (
    <>
      <CustDropDown handleClick={handleClick}/>
      <hr/>
      <CustDropDown size='md' handleClick={handleClick}/>
    </>
  )
}

export const DropdownWithIcons = TemplateDropdown.bind({})

const ControlSVGIcon = styled(ControlSVG)`
    width: 18px;
    padding: 2px;
    margin-right: 10px;
`

const SurveillanceSVGIcon = styled(SurveillanceSVG)`
    margin-right: 10px;
`
const NoteSVGIcon = styled(NoteSVG)`
  margin-right: 10px;
`