import React from 'react';
import { ButtonToolbar, Button, IconButton } from 'rsuite';
import StarIcon from '@rsuite/icons/legacy/Star';

import { ReactComponent as EditIconSVG } from './icons/editer_12px.svg'

export default {
  title: 'RsuiteMonitor/Buttons'
};

const TemplateButtons = ({label, ...args}) => (
  <>
    <ButtonToolbar>
      <Button appearance="primary" {...args} >Primary</Button>
      <Button appearance="default" {...args} >Default</Button>
      <Button appearance="link" {...args} >Link</Button>
      <Button appearance="ghost" {...args} >Ghost</Button>
    </ButtonToolbar>
    <br />
    <ButtonToolbar>
      <Button appearance="default" {...args} >{label}</Button>
      <Button appearance="primary" {...args} >{label}</Button>
      <Button appearance="link" {...args} >{label}</Button>
      <Button appearance="subtle" {...args} >{label}</Button>
      <Button appearance="ghost" {...args} >{label}</Button>
    </ButtonToolbar>
    <br />
    <ButtonToolbar>
      <IconButton appearance="primary" {...args} icon={<EditIconSVG className={"rs-icon"} />} >Primary</IconButton>
      <IconButton appearance="default" {...args} icon={<EditIconSVG className={"rs-icon"} />} >Default</IconButton>
      <IconButton appearance="link" {...args} icon={<EditIconSVG className={"rs-icon"} />} >Link</IconButton>
      <IconButton appearance="ghost" {...args} icon={<EditIconSVG className={"rs-icon"} />} >Ghost</IconButton>
    </ButtonToolbar>
    <br />
    <ButtonToolbar>
      <IconButton appearance="default" {...args} icon={<EditIconSVG className={"rs-icon"} />} >{label}</IconButton>
      <IconButton appearance="primary" {...args} icon={<EditIconSVG className={"rs-icon"} />} >{label}</IconButton>
      <IconButton appearance="link" {...args} icon={<EditIconSVG className={"rs-icon"} />} >{label}</IconButton>
      <IconButton appearance="subtle" {...args} icon={<EditIconSVG className={"rs-icon"} />} >{label}</IconButton>
      <IconButton appearance="ghost" {...args} icon={<EditIconSVG className={"rs-icon"} />} >{label}</IconButton>
    </ButtonToolbar>
    <br />
    <ButtonToolbar>
      <IconButton appearance="primary" {...args} icon={<StarIcon />} >Primary</IconButton>
      <IconButton appearance="default" {...args} icon={<StarIcon />} >Default</IconButton>
      <IconButton appearance="link" {...args} icon={<StarIcon />} >Link</IconButton>
      <IconButton appearance="ghost" {...args} icon={<StarIcon />} >Ghost</IconButton>
    </ButtonToolbar>
    <br />
    <ButtonToolbar>
      <IconButton appearance="default" {...args} icon={<StarIcon />} >{label}</IconButton>
      <IconButton appearance="primary" {...args} icon={<StarIcon />} >{label}</IconButton>
      <IconButton appearance="link" {...args} icon={<StarIcon />} >{label}</IconButton>
      <IconButton appearance="subtle" {...args} icon={<StarIcon />} >{label}</IconButton>
      <IconButton appearance="ghost" {...args} icon={<StarIcon />} >{label}</IconButton>
    </ButtonToolbar>
  </>
  );


export const NormalButtons = TemplateButtons.bind({});
NormalButtons.args = {
  label: 'Enregistrer',
};

export const SmallButtons = TemplateButtons.bind({})
SmallButtons.args = {
  size: "sm",
  label: "Editer"
}

const TemplateIconButtons = ({label, ...args}) => {
  return (
    <>
      <ButtonToolbar>
        <IconButton appearance="default" {...args} icon={<StarIcon />} />
        <IconButton appearance="primary" {...args} icon={<StarIcon />} />
        <IconButton appearance="link" {...args} icon={<StarIcon />} />
        <IconButton appearance="subtle" {...args} icon={<StarIcon />} />
        <IconButton appearance="ghost" {...args} icon={<StarIcon />} />
      </ButtonToolbar>
      <br/>
      <ButtonToolbar>
        <IconButton appearance="default" size={"sm"} {...args} icon={<StarIcon />} />
        <IconButton appearance="primary" size={"sm"} {...args} icon={<StarIcon />} />
        <IconButton appearance="link" size={"sm"} {...args} icon={<StarIcon />} />
        <IconButton appearance="subtle" size={"sm"} {...args} icon={<StarIcon />} />
        <IconButton appearance="ghost" size={"sm"} {...args} icon={<StarIcon />} />
      </ButtonToolbar>
      <br/>
    </>

  )
}
export const IconButtons = TemplateIconButtons.bind({})

const TemplateSpecialStates = ({label, ...args}) => {
  return (<>
      <ButtonToolbar>
        <IconButton active appearance="primary" {...args} icon={<StarIcon />} />
        <Button active appearance="primary" {...args} >Primary Active</Button>
        <IconButton active appearance="primary" {...args} icon={<StarIcon />} >{label}</IconButton>
      </ButtonToolbar>
      <ButtonToolbar>
        <Button appearance="default" disabled>
        Default
      </Button>
      <Button appearance="primary" disabled>
        Primary
      </Button>
      <Button appearance="link" disabled href="https://rsuitejs.com">
        Link
      </Button>
      <Button appearance="subtle" disabled>
        Subtle
      </Button>
      <Button appearance="ghost" disabled>
        Ghost
      </Button>
      <IconButton icon={<StarIcon />} disabled>
        Icon Button
      </IconButton>
      </ButtonToolbar>
  </>
  )
}

export const SpecialButtonStates = TemplateSpecialStates.bind({})
SpecialButtonStates.args = {
  label: 'Special active state'
}